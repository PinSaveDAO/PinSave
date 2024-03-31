import {
  PublicKey,
  PrivateKey,
  Mina,
  AccountUpdate,
  VerificationKey,
  PendingTransaction,
} from 'o1js';

import { SwapContract } from '../SwapContract.js';

export async function deploySwapApp(
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
