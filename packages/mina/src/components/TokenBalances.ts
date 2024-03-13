import { PublicKey, Mina, Field, fetchAccount, SmartContract } from 'o1js';

export function logMinaBalance(address: PublicKey) {
  const balance = getMinaBalance(address);
  console.log(address.toBase58() + ' Mina balance:', balance);
}

export async function logTokenBalances(
  address: PublicKey,
  zkApp: SmartContract
) {
  const balance = await getTokenAddressBalance(address, zkApp.token.id);
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

export async function getTokenAddressBalance(
  address: PublicKey,
  tokenId: Field = Field(1)
) {
  let balance: bigint = 0n;
  try {
    await fetchAccount({ publicKey: address, tokenId: tokenId });
    const fetchedBalance = Mina.getBalance(address, tokenId).value.toBigInt();
    balance = fetchedBalance / BigInt(1e9);
  } catch (e) {
    console.log(
      `balance of ${tokenId} token for address ${address.toBase58()} is 0`
    );
  }
  return balance;
}
