import {
  PublicKey,
  PrivateKey,
  Mina,
  AccountUpdate,
  MerkleMap,
  MerkleMapWitness,
  Field,
  VerificationKey,
  UInt64,
  Signature,
} from 'o1js';

import { MerkleMapContract } from '../NFTsMapContract.js';
import { compareLogStates } from './AppState.js';
import { NFTtoHash, NFT } from './NFT.js';
import {
  logTokenBalances,
  getTokenBalances,
  getTokenIdBalance,
} from './TokenBalances.js';

export async function setFee(
  zkAppPrivateKey: PrivateKey,
  deployerPk: PrivateKey,
  contract: MerkleMapContract,
  fee: UInt64 = UInt64.one
) {
  const deployerAddress: PublicKey = deployerPk.toPublicKey();
  const feeFields: Field[] = fee.toFields();
  const feeSignature: Signature = Signature.create(zkAppPrivateKey, feeFields);

  const txn: Mina.Transaction = await Mina.transaction(deployerAddress, () => {
    contract.setFee(fee, feeSignature);
  });

  await sendWaitTx(txn, [deployerPk], false);
}

export async function initNFTLive(
  pubKey: PublicKey,
  pk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  compile: boolean = false,
  live: boolean = true
) {
  if (compile) {
    await MerkleMapContract.compile();
  }

  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);

  const txOptions = createTxOptions(pubKey, live);

  const initMintTx: Mina.Transaction = await Mina.transaction(txOptions, () => {
    zkAppInstance.initNft(_NFT, witnessNFT);
  });
  await sendWaitTx(initMintTx, [pk], live);
  merkleMap.set(nftId, NFTtoHash(_NFT));
}

export async function createInitNFTTxFromMap(
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  compile: boolean = true,
  txOptions: TxOptions
) {
  if (compile) {
    await MerkleMapContract.compile();
  }
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);

  const initMintTx: Mina.Transaction = await Mina.transaction(txOptions, () => {
    zkAppInstance.initNft(_NFT, witnessNFT);
  });
  await initMintTx.prove();
  return initMintTx;
}

export async function createMintTxFromMap(
  pubKey: PublicKey,
  zkAppInstance: MerkleMapContract,
  _NFT: NFT,
  merkleMap: MerkleMap,
  compile: boolean = true,
  txOptions: TxOptions
) {
  if (compile) {
    await MerkleMapContract.compile();
  }
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);
  const mintTx = await createMintTxLive(
    pubKey,
    zkAppInstance,
    _NFT,
    witnessNFT,
    txOptions
  );
  await mintTx.prove();
  return mintTx;
}

export async function mintNFTwithMapLive(
  pk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  compile: boolean = false,
  live: boolean = true
) {
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);
  await mintNFTLive(pk, _NFT, zkAppInstance, witnessNFT, compile, live);
}

export async function mintNFTLive(
  pk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMapWitness: MerkleMapWitness,
  compile: boolean = false,
  live = true
) {
  if (compile) {
    await MerkleMapContract.compile();
  }
  const pubKey: PublicKey = pk.toPublicKey();
  const txOptions = createTxOptions(pubKey, live);

  const mint_tx = await createMintTxLive(
    pubKey,
    zkAppInstance,
    _NFT,
    merkleMapWitness,
    txOptions
  );

  await sendWaitTx(mint_tx, [pk], live);
}

export async function createMintTxLive(
  pubKey: PublicKey,
  zkAppInstance: MerkleMapContract,
  _NFT: NFT,
  merkleMapWitness: MerkleMapWitness,
  txOptions: TxOptions
) {
  const recipientBalance = await getTokenIdBalance(
    pubKey,
    zkAppInstance.token.id
  );
  let mint_tx: Mina.Transaction;

  if (recipientBalance > 0) {
    mint_tx = await Mina.transaction(txOptions, () => {
      zkAppInstance.mintNft(_NFT, merkleMapWitness);
    });
  } else {
    mint_tx = await Mina.transaction(txOptions, () => {
      AccountUpdate.fundNewAccount(pubKey);
      zkAppInstance.mintNft(_NFT, merkleMapWitness);
    });
  }
  return mint_tx;
}

export async function transferNft(
  pk: PrivateKey,
  recipient: PublicKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  zkAppPrivateKey: PrivateKey,
  live: boolean = true,
  displayLogs: boolean = false
) {
  const pubKey: PublicKey = pk.toPublicKey();
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);

  const transferSignature: Signature = Signature.create(
    zkAppPrivateKey,
    NFT.toFields(_NFT)
  );

  const recipientBalance = getTokenBalances(recipient, zkAppInstance);

  let nft_transfer_tx: Mina.Transaction;
  if (recipientBalance > 0) {
    nft_transfer_tx = await Mina.transaction(pubKey, () => {
      zkAppInstance.transfer(_NFT, recipient, witnessNFT, transferSignature);
    });
  } else {
    nft_transfer_tx = await Mina.transaction(pubKey, () => {
      AccountUpdate.fundNewAccount(pubKey);
      zkAppInstance.transfer(_NFT, recipient, witnessNFT, transferSignature);
    });
  }

  await sendWaitTx(nft_transfer_tx, [pk], live);

  _NFT.changeOwner(recipient);

  merkleMap.set(nftId, NFTtoHash(_NFT));

  if (displayLogs) {
    logTokenBalances(pubKey, zkAppInstance);
    logTokenBalances(recipient, zkAppInstance);

    compareLogStates(zkAppInstance, merkleMap);
  }
}

export async function initRootWithApp(
  zkAppPrivateKey: PrivateKey,
  pk: PrivateKey,
  merkleMap: MerkleMap,
  totalInited: number,
  compile: boolean = false,
  live: boolean = true
) {
  const zkAppPub: PublicKey = zkAppPrivateKey.toPublicKey();
  if (compile) {
    await MerkleMapContract.compile();
  }
  const zkAppInstance: MerkleMapContract = new MerkleMapContract(zkAppPub);
  await initAppRoot(
    zkAppPrivateKey,
    pk,
    zkAppInstance,
    merkleMap,
    totalInited,
    live
  );
}

export async function initAppRoot(
  zkAppPrivateKey: PrivateKey,
  pk: PrivateKey,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  totalInited: number,
  live: boolean = true,
  displayLogs: boolean = false
) {
  const pubKey: PublicKey = pk.toPublicKey();
  const rootBefore: Field = merkleMap.getRoot();
  const totalSupplied: UInt64 = UInt64.from(totalInited);

  const rootSignature: Signature = Signature.create(
    zkAppPrivateKey,
    zkAppInstance.address.toFields()
  );

  const txOptions = createTxOptions(pubKey, live);

  const init_tx: Mina.Transaction = await Mina.transaction(txOptions, () => {
    zkAppInstance.initRoot(
      rootBefore,
      totalSupplied,
      UInt64.zero,
      new UInt64(255),
      rootSignature
    );
  });

  await sendWaitTx(init_tx, [pk], live);

  if (displayLogs) {
    compareLogStates(zkAppInstance, merkleMap);
  }
}

export async function deployApp(
  pk: PrivateKey,
  proofsEnabled: boolean = true,
  live: boolean = true,
  displayLogs: boolean = false
): Promise<{
  merkleMap: MerkleMap;
  zkAppInstance: MerkleMapContract;
  zkAppPk: PrivateKey;
}> {
  let verificationKey: VerificationKey | undefined;

  if (proofsEnabled) {
    ({ verificationKey } = await MerkleMapContract.compile());
    console.log('compiled');
  }

  const zkAppPrivateKey: PrivateKey = PrivateKey.random();
  const zkAppAddress: PublicKey = zkAppPrivateKey.toPublicKey();

  const zkAppInstance: MerkleMapContract = new MerkleMapContract(zkAppAddress);
  const merkleMap: MerkleMap = new MerkleMap();

  const pubKey: PublicKey = pk.toPublicKey();

  const deployTxnOptions = createTxOptions(pubKey, live);

  const deployTx: Mina.Transaction = await Mina.transaction(
    deployTxnOptions,
    () => {
      AccountUpdate.fundNewAccount(pubKey);
      zkAppInstance.deploy({ verificationKey, zkappKey: zkAppPrivateKey });
    }
  );

  await sendWaitTx(deployTx, [pk], live);

  if (displayLogs) {
    compareLogStates(zkAppInstance, merkleMap, live);
  }

  return {
    merkleMap: merkleMap,
    zkAppInstance: zkAppInstance,
    zkAppPk: zkAppPrivateKey,
  };
}

export async function sendWaitTx(
  tx: Mina.Transaction,
  pks: PrivateKey[],
  live: boolean = true
) {
  tx.sign(pks);
  await tx.prove();

  let pendingTx = await tx.send();
  if (live) {
    console.log(`Got pending transaction with hash ${pendingTx.hash()}`);

    // Wait until transaction is included in a block
    await pendingTx.wait();
    if (!pendingTx.isSuccess) {
      throw new Error('tx not successful');
    }
  }
}

export function createTxOptions(
  pubKey: PublicKey,
  live: boolean = true,
  fee: number = 100_000_000
) {
  const txOptions: { sender: PublicKey; fee?: number } = {
    sender: pubKey,
  };
  if (live) {
    txOptions.fee = fee;
  }
  return txOptions;
}

export type TxOptions = {
  sender: PublicKey;
  fee?: number | undefined;
};
