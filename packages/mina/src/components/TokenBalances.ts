import { PublicKey, Mina, Field, fetchAccount, SmartContract } from 'o1js';

export function logMinaBalance(address: PublicKey) {
  const balance = getMinaBalance(address);
  console.log(address.toBase58() + ' Mina balance:', balance);
}

export function logTokenBalances(address: PublicKey, zkApp: SmartContract) {
  const balance = getTokenAddressBalance(address, zkApp.token.id);
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

export function getTokenAddressBalance(address: PublicKey, tokenId: Field) {
  let balance: bigint = 0n;
  try {
    const fetchedBalance = Mina.getBalance(address, tokenId).value.toBigInt();
    balance = fetchedBalance / BigInt(1e9);
  } catch (e) {
    console.log(
      `balance of ${tokenId} token for address ${address.toBase58()} is 0`
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
    const fetchedBalance = data.account.balance.toBigInt();
    tokenBalance = fetchedBalance / BigInt(1e9);
  }
  return tokenBalance;
}
