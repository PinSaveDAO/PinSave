import { PublicKey, Mina, Field, fetchAccount } from 'o1js';

import { MerkleMapContract } from '../NFTsMapContract.js';

export function logMinaBalance(address: PublicKey) {
  const balance = getMinaBalance(address);
  console.log(address.toBase58() + ' Mina balance:', balance);
}

export function logTokenBalances(address: PublicKey, zkApp: MerkleMapContract) {
  const balance = getTokenBalances(address, zkApp);
  console.log(address.toBase58() + ' zkApp tokens:', balance);
}

export function getMinaBalance(address: PublicKey) {
  let balance: bigint = 0n;
  try {
    balance = Mina.getBalance(address).value.toBigInt();
  } catch (e) {
    console.log(`balance of Mina for address ${address.toBase58()} is 0`);
  }
  return balance;
}

export function getTokenBalances(address: PublicKey, zkApp: MerkleMapContract) {
  let balance: bigint = 0n;
  try {
    balance = Mina.getBalance(address, zkApp.token.id).value.toBigInt();
  } catch (e) {
    console.log(
      `balance of ${
        zkApp.token.id
      } token for address ${address.toBase58()} is 0`
    );
  }
  return balance;
}

export async function getTokenIdBalance(
  pub: PublicKey,
  tokenId: Field = Field(1)
) {
  const data = await fetchAccount({ publicKey: pub, tokenId: tokenId });
  let tokenBalance = 0n;
  if (data.account?.balance) {
    tokenBalance = data.account.balance.toBigInt();
  }
  return tokenBalance;
}
