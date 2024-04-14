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
  Transaction,
} from 'o1js';

import { initNFTtoMap, mintNFTtoMap } from './NFT/merkleMap.js';
import { NFT } from './NFT/NFT.js';
import { getTokenAddressBalance } from './TokenBalances.js';
import { NFTContract } from '../NFTsMapContract.js';
import { InitState, createInitState } from './NFT/InitState.js';

export async function setNFTContractFee(
  pkAdmin: PrivateKey,
  nftContract: NFTContract,
  fee: UInt64 = UInt64.one,
  live: boolean = false
): Promise<TxStatus> {
  const adminPub: PublicKey = pkAdmin.toPublicKey();
  const txn: Transaction = await Mina.transaction(adminPub, () => {
    nftContract.setFee(fee);
  });
  const txStatus: TxStatus = await sendWaitTx(txn, [pkAdmin], live);
  return txStatus;
}

export async function initNFT(
  pkAdmin: PrivateKey,
  pkSender: PrivateKey,
  _NFT: NFT,
  zkAppInstance: NFTContract,
  merkleMap: MerkleMap,
  compile: boolean = false,
  live: boolean = true
): Promise<boolean> {
  if (compile) {
    await NFTContract.compile();
  }
  const senderPub: PublicKey = pkSender.toPublicKey();
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);
  const txOptions: TxOptions = createTxOptions(senderPub, live);
  const adminSignature: Signature = Signature.create(pkAdmin, _NFT.toFields());
  const initMintTx: Transaction = await Mina.transaction(txOptions, () => {
    zkAppInstance.initNFT(_NFT, witnessNFT, adminSignature);
  });
  const txStatus: TxStatus = await sendWaitTx(initMintTx, [pkSender], live);
  if (!live || txStatus === 'included') {
    initNFTtoMap(_NFT, merkleMap);
  }
  return true;
}

export async function createInitNFTTxFromMap(
  _NFT: NFT,
  nftContract: NFTContract,
  merkleMap: MerkleMap,
  adminSignature: Signature,
  compile: boolean = true,
  txOptions: TxOptions
): Promise<string> {
  if (compile) {
    await NFTContract.compile();
  }
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);
  const initMintTx: Transaction = await Mina.transaction(txOptions, () => {
    nftContract.initNFT(_NFT, witnessNFT, adminSignature);
  });
  await initMintTx.prove();
  return initMintTx.toJSON();
}

export async function createMintTxFromMap(
  senderPub: PublicKey,
  nftContract: NFTContract,
  _NFT: NFT,
  merkleMap: MerkleMap,
  adminSignature: Signature,
  compile: boolean = true,
  txOptions: TxOptions
): Promise<string> {
  if (compile) {
    await NFTContract.compile();
  }
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);
  const mintTx: Transaction = await createMintTx(
    senderPub,
    nftContract,
    _NFT,
    witnessNFT,
    adminSignature,
    txOptions
  );
  await mintTx.prove();
  return mintTx.toJSON();
}

export async function mintNFTwithMap(
  pkAdmin: PrivateKey,
  pkSender: PrivateKey,
  _NFT: NFT,
  nftContract: NFTContract,
  merkleMap: MerkleMap,
  compile: boolean = false,
  live: boolean = true
): Promise<boolean> {
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);
  const txStatus: TxStatus = await mintNFT(
    pkAdmin,
    pkSender,
    _NFT,
    nftContract,
    witnessNFT,
    compile,
    live
  );
  if (!live || txStatus === 'included') {
    mintNFTtoMap(_NFT, merkleMap);
  }
  return true;
}

export async function mintNFT(
  pkAdmin: PrivateKey,
  pkSender: PrivateKey,
  _NFT: NFT,
  nftContract: NFTContract,
  merkleMapWitness: MerkleMapWitness,
  compile: boolean = false,
  live = true
): Promise<TxStatus> {
  if (compile) {
    await NFTContract.compile();
  }
  const senderPub: PublicKey = pkSender.toPublicKey();
  const txOptions: TxOptions = createTxOptions(senderPub, live);
  const adminSignature: Signature = Signature.create(pkAdmin, _NFT.toFields());
  const mint_tx: Transaction = await createMintTx(
    senderPub,
    nftContract,
    _NFT,
    merkleMapWitness,
    adminSignature,
    txOptions
  );
  const txStatus: TxStatus = await sendWaitTx(mint_tx, [pkSender], live);
  return txStatus;
}

export async function createMintTx(
  senderPub: PublicKey,
  nftContract: NFTContract,
  _NFT: NFT,
  merkleMapWitness: MerkleMapWitness,
  adminSignature: Signature,
  txOptions: TxOptions
): Promise<Transaction> {
  const recipientBalance: bigint = await getTokenAddressBalance(
    senderPub,
    nftContract.deriveTokenId()
  );
  let mint_tx: Transaction;
  if (recipientBalance > 0n) {
    mint_tx = await Mina.transaction(txOptions, () => {
      nftContract.mintNFT(_NFT, merkleMapWitness, adminSignature);
    });
  } else {
    mint_tx = await Mina.transaction(txOptions, () => {
      AccountUpdate.fundNewAccount(senderPub);
      nftContract.mintNFT(_NFT, merkleMapWitness, adminSignature);
    });
  }
  return mint_tx;
}

export async function transferNFT(
  pkAdmin: PrivateKey,
  pkSender: PrivateKey,
  recipient: PublicKey,
  _NFT: NFT,
  zkAppInstance: NFTContract,
  merkleMap: MerkleMap,
  live: boolean = true
): Promise<boolean> {
  const senderPub: PublicKey = pkSender.toPublicKey();
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);
  const recipientBalance: bigint = await getTokenAddressBalance(
    recipient,
    zkAppInstance.deriveTokenId()
  );
  const adminSignature: Signature = Signature.create(pkAdmin, _NFT.toFields());
  let nft_transfer_tx: Transaction;
  if (recipientBalance > 0n) {
    nft_transfer_tx = await Mina.transaction(senderPub, () => {
      zkAppInstance.transferNFT(_NFT, recipient, witnessNFT, adminSignature);
    });
  } else {
    nft_transfer_tx = await Mina.transaction(senderPub, () => {
      AccountUpdate.fundNewAccount(senderPub);
      zkAppInstance.transferNFT(_NFT, recipient, witnessNFT, adminSignature);
    });
  }
  const txStatus: TxStatus = await sendWaitTx(
    nft_transfer_tx,
    [pkSender],
    live
  );
  if (!live || txStatus === 'included') {
    _NFT.changeOwner(recipient);
    merkleMap.set(nftId, _NFT.hash());
  }
  return true;
}

export async function initRootWithCompile(
  pkAdmin: PrivateKey,
  pkSender: PrivateKey,
  merkleMap: MerkleMap,
  nftContract: NFTContract,
  totalInited: number,
  compile: boolean = false,
  live: boolean = true
): Promise<TxStatus> {
  if (compile) {
    await NFTContract.compile();
  }
  const txStatus: TxStatus = await initNFTContractRoot(
    pkAdmin,
    pkSender,
    merkleMap,
    nftContract,
    totalInited,
    live
  );
  return txStatus;
}

export async function initNFTContractRoot(
  pkAdmin: PrivateKey,
  pkSender: PrivateKey,
  merkleMap: MerkleMap,
  nftContract: NFTContract,
  totalInited: number,
  live: boolean = false
): Promise<TxStatus> {
  const userPub: PublicKey = pkSender.toPublicKey();
  const initStruct: InitState = createInitState(merkleMap, totalInited);
  const thisAppSignature: Signature = Signature.create(
    pkAdmin,
    initStruct.toFields()
  );
  const txOptions: TxOptions = createTxOptions(userPub, live);
  const init_tx: Transaction = await Mina.transaction(txOptions, () => {
    nftContract.initRoot(initStruct, thisAppSignature);
  });
  const txStatus: TxStatus = await sendWaitTx(init_tx, [pkSender], live);
  return txStatus;
}

export async function deployNFTContract(
  pkSender: PrivateKey,
  nftContractPK: PrivateKey,
  proofsEnabled: boolean = true,
  live: boolean = true
): Promise<TxStatus> {
  let verificationKey: VerificationKey | undefined;
  if (proofsEnabled) {
    ({ verificationKey } = await NFTContract.compile());
  }
  const zkAppAddress: PublicKey = nftContractPK.toPublicKey();
  const zkAppInstance: NFTContract = new NFTContract(zkAppAddress);
  const pubKey: PublicKey = pkSender.toPublicKey();
  const deployTxnOptions: TxOptions = createTxOptions(pubKey, live);
  const deployTx: Transaction = await Mina.transaction(deployTxnOptions, () => {
    AccountUpdate.fundNewAccount(pubKey);
    zkAppInstance.deploy({ verificationKey, zkappKey: nftContractPK });
  });
  const txStatus: TxStatus = await sendWaitTx(deployTx, [pkSender], live);
  return txStatus;
}

export async function sendWaitTx(
  tx: Transaction,
  pks: PrivateKey[],
  live: boolean = true
): Promise<TxStatus> {
  tx.sign(pks);
  await tx.prove();
  let pendingTx: PendingTransaction = await tx.send();
  if (live) {
    if (pendingTx.status === 'pending') {
      const transaction: Mina.IncludedTransaction | Mina.RejectedTransaction =
        await pendingTx.safeWait();
      return transaction.status;
    }
    throw new Error('tx not accepted by Mina Daemon');
  }
}

export function createTxOptions(
  senderPub: PublicKey,
  live: boolean = true,
  fee: number = 8e7
): TxOptions {
  const txOptions: TxOptions = {
    sender: senderPub,
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
