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

import { createTxOptions } from './transactions.js';
import { SwapContract } from '../SwapContract.js';
import { TxOptions, TxStatus } from './transactions.js';
import { InitSwapState, createInitSwapState } from './Swap/InitSwap.js';

export async function deploySwapContract(
  senderPK: PrivateKey,
  zkAppPrivateKey: PrivateKey,
  proofsEnabled: boolean = true,
  live: boolean = true
) {
  let verificationKey: VerificationKey | undefined;
  if (proofsEnabled) {
    ({ verificationKey } = await SwapContract.compile());
  }
  const zkAppAddress: PublicKey = zkAppPrivateKey.toPublicKey();
  const zkAppInstance: SwapContract = new SwapContract(zkAppAddress);
  const pubKey: PublicKey = senderPK.toPublicKey();
  const deployTxnOptions = createTxOptions(pubKey, live);
  const deployTx: Mina.Transaction = await Mina.transaction(
    deployTxnOptions,
    () => {
      AccountUpdate.fundNewAccount(pubKey);
      zkAppInstance.deploy({ verificationKey, zkappKey: zkAppPrivateKey });
    }
  );
  const txStatus = await sendWaitTx(deployTx, [senderPK], live);
  return txStatus;
}

export async function initSwapContractRoot(
  adminPK: PrivateKey,
  userPK: PrivateKey,
  merkleMap: MerkleMap,
  zkAppInstance: SwapContract,
  live: boolean = false
): Promise<TxStatus> {
  const userPub: PublicKey = userPK.toPublicKey();
  const InitSwapStateStruct: InitSwapState = createInitSwapState(merkleMap);
  const AdminSignature: Signature = Signature.create(
    adminPK,
    InitSwapStateStruct.toFields()
  );
  const txOptions: TxOptions = createTxOptions(userPub, live);
  const init_tx: Transaction = await Mina.transaction(txOptions, () => {
    zkAppInstance.initRoot(InitSwapStateStruct, AdminSignature);
  });
  const txStatus: TxStatus = await sendWaitTx(init_tx, [userPK], live);
  return txStatus;
}

export async function setSwapContractFee(
  adminPk: PrivateKey,
  contract: SwapContract,
  fee: UInt64 = UInt64.one,
  live: boolean = false
): Promise<TxStatus> {
  const deployerAddress: PublicKey = adminPk.toPublicKey();
  const txn: Transaction = await Mina.transaction(deployerAddress, () => {
    contract.setFee(fee);
  });
  const txStatus: TxStatus = await sendWaitTx(txn, [adminPk], live);
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
