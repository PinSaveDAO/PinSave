import Web3 from "web3";

import { createContractsInstance } from "./profile";

export const transferLXY = async (
  profileAddress: string,
  recipientAddress: string,
  amount: string,
  web3: Web3
) => {
  // const myEOA = web3.eth.accounts.wallet.add(process.env.NEXT_PRIVATE_KEY );
  // instantiate contracts
  const { profileContract, keyManagerContract } = await createContractsInstance(
    profileAddress,
    web3
  );

  const OPERATION_CALL = 0;
  const amountInWei = web3.utils.toWei(amount);
  // payload executed at the target (here nothing, just a plain LYX transfer)
  const data = "0x";

  console.log(amountInWei);

  // encode the payload to transfer LYX from the UP
  const transferLYXPayload = await profileContract.methods
    .execute(OPERATION_CALL, recipientAddress, amountInWei, data)
    .encodeABI();

  // execute the LYX transfer via the Key Manager
  const transaction = await keyManagerContract.methods.execute(
    transferLYXPayload
  );
  //.send({ from: myEOA.address, gasLimit: 300_000 });

  return transaction;
};
