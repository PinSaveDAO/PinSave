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
import { PendingTransaction } from 'o1js/dist/node/lib/mina.js';

import { compareLogStates } from './AppState.js';
import { initNFTtoMap, mintNFTtoMap } from './NFT/merkleMap.js';
import { NFT } from './NFT/NFT.js';
import {
  logTokenBalances,
  getTokenAddressBalance,
  getTokenIdBalance,
} from './TokenBalances.js';
import { MerkleMapContract } from '../NFTsMapContract.js';
import { createInitState } from './NFT/InitState.js';

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
  adminPK: PrivateKey,
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
  const pubKey: PublicKey = pk.toPublicKey();
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);

  const txOptions = createTxOptions(pubKey, live);
  const adminSignature = Signature.create(adminPK, _NFT.toFields());

  const initMintTx: Mina.Transaction = await Mina.transaction(txOptions, () => {
    zkAppInstance.initNFT(_NFT, witnessNFT, adminSignature);
  });
  await sendWaitTx(initMintTx, [pk], live);
  initNFTtoMap(_NFT, merkleMap);
}

export async function createInitNFTTxFromMap(
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  adminSignature: Signature,
  compile: boolean = true,
  txOptions: TxOptions
) {
  if (compile) {
    await MerkleMapContract.compile();
  }
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);

  const initMintTx: Mina.Transaction = await Mina.transaction(txOptions, () => {
    zkAppInstance.initNFT(_NFT, witnessNFT, adminSignature);
  });
  await initMintTx.prove();
  return initMintTx;
}

export async function createMintTxFromMap(
  pubKey: PublicKey,
  zkAppInstance: MerkleMapContract,
  _NFT: NFT,
  merkleMap: MerkleMap,
  adminSignature: Signature,
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
    adminSignature,
    txOptions
  );
  await mintTx.prove();
  return mintTx;
}

export async function mintNFTwithMap(
  adminPK: PrivateKey,
  pk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  compile: boolean = false,
  live: boolean = true
) {
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);
  await mintNFT(adminPK, pk, _NFT, zkAppInstance, witnessNFT, compile, live);
  mintNFTtoMap(_NFT, merkleMap);
}

export async function mintNFT(
  adminPK: PrivateKey,
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
  const adminSignature = Signature.create(adminPK, _NFT.toFields());

  const mint_tx = await createMintTxLive(
    pubKey,
    zkAppInstance,
    _NFT,
    merkleMapWitness,
    adminSignature,
    txOptions
  );

  await sendWaitTx(mint_tx, [pk], live);
}

export async function createMintTxLive(
  pubKey: PublicKey,
  zkAppInstance: MerkleMapContract,
  _NFT: NFT,
  merkleMapWitness: MerkleMapWitness,
  adminSignature: Signature,
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
      zkAppInstance.mintNFT(_NFT, merkleMapWitness, adminSignature);
    });
  } else {
    mint_tx = await Mina.transaction(txOptions, () => {
      AccountUpdate.fundNewAccount(pubKey);
      zkAppInstance.mintNFT(_NFT, merkleMapWitness, adminSignature);
    });
  }
  return mint_tx;
}

export async function transferNFT(
  adminPK: PrivateKey,
  pk: PrivateKey,
  recipient: PublicKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
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

  const adminSignature = Signature.create(adminPK, _NFT.toFields());

  let nft_transfer_tx: Mina.Transaction;
  if (recipientBalance > 0) {
    nft_transfer_tx = await Mina.transaction(pubKey, () => {
      zkAppInstance.transfer(_NFT, recipient, witnessNFT, adminSignature);
    });
  } else {
    nft_transfer_tx = await Mina.transaction(pubKey, () => {
      AccountUpdate.fundNewAccount(pubKey);
      zkAppInstance.transfer(_NFT, recipient, witnessNFT, adminSignature);
    });
  }

  await sendWaitTx(nft_transfer_tx, [pk], live);

  _NFT.changeOwner(recipient);

  merkleMap.set(nftId, _NFT.hash());

  if (displayLogs) {
    logTokenBalances(pubKey, zkAppInstance);
    logTokenBalances(recipient, zkAppInstance);

    compareLogStates(zkAppInstance, merkleMap);
  }
}

export async function initRootWithApp(
  zkAppPK: PrivateKey,
  pk: PrivateKey,
  merkleMap: MerkleMap,
  totalInited: number,
  compile: boolean = false,
  live: boolean = true
) {
  if (compile) {
    await MerkleMapContract.compile();
  }
  const zkAppPub: PublicKey = zkAppPK.toPublicKey();
  const zkAppInstance: MerkleMapContract = new MerkleMapContract(zkAppPub);
  await initAppRoot(zkAppPK, pk, zkAppInstance, merkleMap, totalInited, live);
}

export async function initAppRoot(
  zkAppPK: PrivateKey,
  adminPK: PrivateKey,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  totalInited: number,
  live: boolean = false,
  displayLogs: boolean = false
) {
  const pubKey: PublicKey = adminPK.toPublicKey();

  const initStruct = createInitState(merkleMap, totalInited);

  const thisAppSignature = Signature.create(zkAppPK, initStruct.toFields());

  const txOptions = createTxOptions(pubKey, live);

  const init_tx: Mina.Transaction = await Mina.transaction(txOptions, () => {
    zkAppInstance.initRoot(initStruct, thisAppSignature);
  });

  await sendWaitTx(init_tx, [adminPK], live);

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

  let pendingTx: PendingTransaction = await tx.send();
  if (live) {
    console.log(`Got pending transaction with hash ${pendingTx.hash}`);

    if (pendingTx.status === 'pending') {
      try {
        await pendingTx.safeWait();
      } catch (error) {
        throw new Error('tx not successful');
      }
    } else {
      throw new Error('tx not accepted by Mina Daemon');
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
