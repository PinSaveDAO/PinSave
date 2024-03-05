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
} from 'o1js';

import { compareLogStates } from './AppState.js';
import { NFTtoHash, NFT } from './NFT.js';
import {
  logTokenBalances,
  getTokenAddressBalance,
  getTokenIdBalance,
} from './TokenBalances.js';
import { MerkleMapContract } from '../NFTsMapContract.js';

export async function setFee(
  deployerPk: PrivateKey,
  contract: MerkleMapContract,
  fee: UInt64 = UInt64.one,
  live: boolean = false
) {
  const deployerAddress: PublicKey = deployerPk.toPublicKey();

  const txn: Mina.Transaction = await Mina.transaction(deployerAddress, () => {
    contract.setFee(fee);
  });

  await sendWaitTx(txn, [deployerPk], live);
}

export async function initNFT(
  zkAppPK: PrivateKey,
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
    zkAppInstance.initNFT(_NFT, witnessNFT);
  });
  await sendWaitTx(initMintTx, [pk, zkAppPK], live);
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
    zkAppInstance.initNFT(_NFT, witnessNFT);
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

export async function mintNFTwithMap(
  zkAppPK: PrivateKey,
  pk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  compile: boolean = false,
  live: boolean = true
) {
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);
  await mintNFT(zkAppPK, pk, _NFT, zkAppInstance, witnessNFT, compile, live);
}

export async function mintNFT(
  zkAppPK: PrivateKey,
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

  await sendWaitTx(mint_tx, [pk, zkAppPK], live);
}

export async function createMintTxLive(
  pubKey: PublicKey,
  zkAppInstance: MerkleMapContract,
  _NFT: NFT,
  merkleMapWitness: MerkleMapWitness,
  txOptions: TxOptions
) {
  let recipientBalance;
  if (txOptions.fee) {
    recipientBalance = await getTokenIdBalance(pubKey, zkAppInstance.token.id);
  }
  if (!txOptions.fee) {
    recipientBalance = getTokenAddressBalance(pubKey, zkAppInstance.token.id);
  }
  let mint_tx: Mina.Transaction;

  if (recipientBalance) {
    mint_tx = await Mina.transaction(txOptions, () => {
      zkAppInstance.mintNFT(_NFT, merkleMapWitness);
    });
  } else {
    mint_tx = await Mina.transaction(txOptions, () => {
      AccountUpdate.fundNewAccount(pubKey);
      zkAppInstance.mintNFT(_NFT, merkleMapWitness);
    });
  }
  return mint_tx;
}

export async function transferNFT(
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

  const recipientBalance = getTokenAddressBalance(
    recipient,
    zkAppInstance.token.id
  );

  let nft_transfer_tx: Mina.Transaction;
  if (recipientBalance > 0) {
    nft_transfer_tx = await Mina.transaction(pubKey, () => {
      zkAppInstance.transfer(_NFT, recipient, witnessNFT);
    });
  } else {
    nft_transfer_tx = await Mina.transaction(pubKey, () => {
      AccountUpdate.fundNewAccount(pubKey);
      zkAppInstance.transfer(_NFT, recipient, witnessNFT);
    });
  }

  await sendWaitTx(nft_transfer_tx, [pk, zkAppPrivateKey], live);

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
  live: boolean = false,
  displayLogs: boolean = false
) {
  const pubKey: PublicKey = pk.toPublicKey();
  const rootBefore: Field = merkleMap.getRoot();
  const totalSupplied: Field = Field(totalInited);

  const maxSupply = Field(255);
  const feeAmount = UInt64.zero;

  const txOptions = createTxOptions(pubKey, live);

  const init_tx: Mina.Transaction = await Mina.transaction(txOptions, () => {
    zkAppInstance.initRoot(rootBefore, totalSupplied, feeAmount, maxSupply);
  });

  await sendWaitTx(init_tx, [pk, zkAppPrivateKey], live);

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
  fee: number = 8e7
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
