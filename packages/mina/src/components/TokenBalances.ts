import { PublicKey } from 'o1js';

import { MerkleMapContract } from '../NFTsMapContract.js';

export function logTokenBalances(
  Mina: any,
  address: PublicKey,
  dexApp: MerkleMapContract
) {
  console.log(
    address.toBase58() + ' zkApp tokens:',
    Mina.getBalance(address, dexApp.token.id).value.toBigInt()
  );
}
