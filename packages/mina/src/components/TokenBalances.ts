import { PublicKey, Mina } from 'o1js';

import { MerkleMapContract } from '../NFTsMapContract.js';

export function logTokenBalances(address: PublicKey, zkApp: MerkleMapContract) {
  const balance = getTokenBalances(address, zkApp);
  console.log(address.toBase58() + ' zkApp tokens:', balance);
}

export function getTokenBalances(address: PublicKey, zkApp: MerkleMapContract) {
  let balance: bigint = 0n;
  try {
    balance = Mina.getBalance(address, zkApp.token.id).value.toBigInt();
  } catch (e) {
    console.log(`balance of ${zkApp.token.id} token for address ${address.toBase58()} is 0`);
  }

  return balance;
}
