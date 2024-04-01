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
  PendingTransaction,
} from 'o1js';

import { initNFTtoMap, mintNFTtoMap } from './NFT/merkleMap.js';
import { NFT } from './NFT/NFT.js';
import { getTokenAddressBalance } from './TokenBalances.js';
import { NFTContract } from '../NFTsMapContract.js';
import { InitState, createInitState } from './NFT/InitState.js';

export async function setFee(
  deployerPk: PrivateKey,
  contract: NFTContract,
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
  senderPK: PrivateKey,
  _NFT: NFT,
  zkAppInstance: NFTContract,
  merkleMap: MerkleMap,
  compile: boolean = false,
  live: boolean = true
) {
  if (compile) {
    await NFTContract.compile();
  }
  const pubKey: PublicKey = senderPK.toPublicKey();
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);
  const txOptions: TxOptions = createTxOptions(pubKey, live);
  const adminSignature: Signature = Signature.create(adminPK, _NFT.toFields());
  const initMintTx: Mina.Transaction = await Mina.transaction(txOptions, () => {
    zkAppInstance.initNFT(_NFT, witnessNFT, adminSignature);
  });
  await sendWaitTx(initMintTx, [senderPK], live);
  initNFTtoMap(_NFT, merkleMap);
}

export async function createInitNFTTxFromMap(
  _NFT: NFT,
  zkAppInstance: NFTContract,
  merkleMap: MerkleMap,
  adminSignature: Signature,
  compile: boolean = true,
  txOptions: TxOptions
) {
  if (compile) {
    await NFTContract.compile();
  }
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);
  const initMintTx: Mina.Transaction = await Mina.transaction(txOptions, () => {
    zkAppInstance.initNFT(_NFT, witnessNFT, adminSignature);
  });
  await initMintTx.prove();
  return initMintTx.toJSON();
}

export async function createMintTxFromMap(
  pubKey: PublicKey,
  zkAppInstance: NFTContract,
  _NFT: NFT,
  merkleMap: MerkleMap,
  adminSignature: Signature,
  compile: boolean = true,
  txOptions: TxOptions
) {
  if (compile) {
    await NFTContract.compile();
  }
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);
  const mintTx: Mina.Transaction = await createMintTx(
    pubKey,
    zkAppInstance,
    _NFT,
    witnessNFT,
    adminSignature,
    txOptions
  );
  await mintTx.prove();
  return mintTx.toJSON();
}

export async function mintNFTwithMap(
  adminPK: PrivateKey,
  pk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: NFTContract,
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
  zkAppInstance: NFTContract,
  merkleMapWitness: MerkleMapWitness,
  compile: boolean = false,
  live = true
) {
  if (compile) {
    await NFTContract.compile();
  }
  const pubKey: PublicKey = pk.toPublicKey();
  const txOptions: TxOptions = createTxOptions(pubKey, live);
  const adminSignature = Signature.create(adminPK, _NFT.toFields());
  const mint_tx: Mina.Transaction = await createMintTx(
    pubKey,
    zkAppInstance,
    _NFT,
    merkleMapWitness,
    adminSignature,
    txOptions
  );
  await sendWaitTx(mint_tx, [pk], live);
}

export async function createMintTx(
  pubKey: PublicKey,
  zkAppInstance: NFTContract,
  _NFT: NFT,
  merkleMapWitness: MerkleMapWitness,
  adminSignature: Signature,
  txOptions: TxOptions
) {
  const recipientBalance: bigint = await getTokenAddressBalance(
    pubKey,
    zkAppInstance.token.id
  );
  let mint_tx: Mina.Transaction;
  if (recipientBalance > 0n) {
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
  zkAppInstance: NFTContract,
  merkleMap: MerkleMap,
  live: boolean = true
) {
  const pubKey: PublicKey = pk.toPublicKey();
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);
  const recipientBalance: bigint = await getTokenAddressBalance(
    recipient,
    zkAppInstance.token.id
  );
  const adminSignature = Signature.create(adminPK, _NFT.toFields());
  let nft_transfer_tx: Mina.Transaction;
  if (recipientBalance > 0n) {
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
}

export async function initRootWithCompile(
  adminPK: PrivateKey,
  pk: PrivateKey,
  merkleMap: MerkleMap,
  zkAppInstance: NFTContract,
  totalInited: number,
  compile: boolean = false,
  live: boolean = true
) {
  if (compile) {
    await NFTContract.compile();
  }
  await initAppRoot(adminPK, pk, merkleMap, zkAppInstance, totalInited, live);
}

export async function initAppRoot(
  adminPK: PrivateKey,
  userPK: PrivateKey,
  merkleMap: MerkleMap,
  zkAppInstance: NFTContract,
  totalInited: number,
  live: boolean = false
) {
  const userPub: PublicKey = userPK.toPublicKey();
  const initStruct: InitState = createInitState(merkleMap, totalInited);
  const thisAppSignature: Signature = Signature.create(
    adminPK,
    initStruct.toFields()
  );
  const txOptions: TxOptions = createTxOptions(userPub, live);
  const init_tx: Mina.Transaction = await Mina.transaction(txOptions, () => {
    zkAppInstance.initRoot(initStruct, thisAppSignature);
  });
  await sendWaitTx(init_tx, [userPK], live);
}

export async function deployApp(
  senderPK: PrivateKey,
  zkAppPrivateKey: PrivateKey,
  proofsEnabled: boolean = true,
  live: boolean = true
) {
  let verificationKey: VerificationKey | undefined;
  if (proofsEnabled) {
    ({ verificationKey } = await NFTContract.compile());
  }
  const zkAppAddress: PublicKey = zkAppPrivateKey.toPublicKey();
  const zkAppInstance: NFTContract = new NFTContract(zkAppAddress);
  const pubKey: PublicKey = senderPK.toPublicKey();
  const deployTxnOptions: TxOptions = createTxOptions(pubKey, live);
  const deployTx: Mina.Transaction = await Mina.transaction(
    deployTxnOptions,
    () => {
      AccountUpdate.fundNewAccount(pubKey);
      zkAppInstance.deploy({ verificationKey, zkappKey: zkAppPrivateKey });
    }
  );
  const txStatus: TxStatus = await sendWaitTx(deployTx, [senderPK], live);
  return txStatus;
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
        const transaction = await pendingTx.safeWait();
        console.log(transaction.status);
        return transaction.status;
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
  const txOptions: TxOptions = {
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

export type TxStatus = 'included' | 'rejected' | undefined;
