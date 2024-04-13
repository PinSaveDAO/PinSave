import {
  PublicKey,
  PrivateKey,
  UInt64,
  Mina,
  AccountUpdate,
  VerificationKey,
  PendingTransaction,
  MerkleMap,
  Transaction,
  Signature,
} from 'o1js';

import { createTxOptions, TxOptions, TxStatus } from './transactions.js';
import { SwapContract } from '../SwapContract.js';
import { InitSwapState, createInitSwapState } from './Swap/InitSwap.js';
import {
  NFTforMinaOrder,
  NFTforNFTOrder,
  createNFTforMinaOrder,
  createNFTforNFTOrder,
} from './Swap/SupplyNFT.js';

export async function deploySwapContract(
  senderPK: PrivateKey,
  swapContractPrivateKey: PrivateKey,
  proofsEnabled: boolean = true,
  live: boolean = true
) {
  let verificationKey: VerificationKey | undefined;
  if (proofsEnabled) {
    ({ verificationKey } = await SwapContract.compile());
  }
  const zkAppAddress: PublicKey = swapContractPrivateKey.toPublicKey();
  const swapContract: SwapContract = new SwapContract(zkAppAddress);
  const senderPub: PublicKey = senderPK.toPublicKey();
  const deployTxnOptions = createTxOptions(senderPub, live);
  const deployTx: Mina.Transaction = await Mina.transaction(
    deployTxnOptions,
    () => {
      AccountUpdate.fundNewAccount(senderPub);
      swapContract.deploy({
        verificationKey,
        zkappKey: swapContractPrivateKey,
      });
    }
  );
  const txStatus = await sendWaitTx(deployTx, [senderPK], live);
  return txStatus;
}

export async function initSwapContractRoot(
  adminPK: PrivateKey,
  senderPK: PrivateKey,
  merkleMap: MerkleMap,
  zkAppInstance: SwapContract,
  live: boolean = false
): Promise<TxStatus> {
  const senderPub: PublicKey = senderPK.toPublicKey();
  const initSwapStateStruct: InitSwapState = createInitSwapState(merkleMap);
  const adminSignature: Signature = Signature.create(
    adminPK,
    initSwapStateStruct.toFields()
  );
  const txOptions: TxOptions = createTxOptions(senderPub, live);
  const initTx: Transaction = await Mina.transaction(txOptions, () => {
    zkAppInstance.initRoot(initSwapStateStruct, adminSignature);
  });
  const txStatus: TxStatus = await sendWaitTx(initTx, [senderPK], live);
  return txStatus;
}

export async function setSwapContractFee(
  adminPK: PrivateKey,
  swapContract: SwapContract,
  fee: UInt64 = UInt64.one,
  live: boolean = false
): Promise<TxStatus> {
  const deployerAddress: PublicKey = adminPK.toPublicKey();
  const txn: Transaction = await Mina.transaction(deployerAddress, () => {
    swapContract.setFee(fee);
  });
  const txStatus: TxStatus = await sendWaitTx(txn, [adminPK], live);
  return txStatus;
}

export async function supplyNFTMinaSwapContract(
  adminPK: PrivateKey,
  nftforMinaOrder: NFTforMinaOrder,
  swapContract: SwapContract,
  live: boolean = false
): Promise<TxStatus> {
  const senderPub: PublicKey = adminPK.toPublicKey();
  const txn: Transaction = await Mina.transaction(senderPub, () => {
    AccountUpdate.fundNewAccount(senderPub);
    swapContract.supplyNFTMina(nftforMinaOrder);
  });
  const txStatus: TxStatus = await sendWaitTx(txn, [adminPK], live);
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
        return transaction.status;
      } catch (error) {
        throw new Error('tx not successful');
      }
    } else {
      throw new Error('tx not accepted by Mina Daemon');
    }
  }
}
