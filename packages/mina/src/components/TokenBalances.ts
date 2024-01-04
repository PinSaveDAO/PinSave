import { PublicKey, Mina } from 'o1js';

import { MerkleMapContract } from '../NFTsMapContract.js';

export function logTokenBalances(address: PublicKey, zkApp: MerkleMapContract) {
  let balance = 0n;
  try {
    balance = Mina.getBalance(address, zkApp.token.id).value.toBigInt();
  } catch (e) {
    //console.log(e);
  }

  console.log(address.toBase58() + ' zkApp tokens:', balance);
}
