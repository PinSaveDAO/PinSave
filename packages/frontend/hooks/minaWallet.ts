import { PublicKey } from "o1js";

function connectMinaWallet() {
  if (typeof window !== "undefined" && typeof window.mina !== "undefined") {
    console.log("Auro Wallet is installed!");
  }
}

async function getMinaNetwork() {
  const network = await window.mina.requestNetwork();
  return network;
}

async function requestMinaAccounts() {
  const account: string[] = await window.mina
    .requestAccounts()
    .catch((err: any) => err);
  return account;
}

export async function getMinaAccount() {
  connectMinaWallet();
  let account: string[] = await window.mina.getAccounts();
  if (account.length === 0) {
    account = await requestMinaAccounts();
    if (account.length === undefined) {
      throw new Error("create an account first");
    }
    if (account.length === 0) {
      throw new Error("no account found");
    }
  }
  return account[0];
}

export async function getMinaPublicKey() {
  connectMinaWallet();
  let account: string[] = await window.mina.getAccounts();
  if (account.length === 0) {
    account = await requestMinaAccounts();
    if (account.length === 0) {
      throw new Error("no account found");
    }
  }
  return PublicKey.fromBase58(account[0]);
}

export async function setMinaAccount() {
  const key = "auroWalletAddress";
  const account: string = await getMinaAccount();
  sessionStorage.setItem(key, account);
  return account;
}
