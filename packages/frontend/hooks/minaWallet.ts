import { PublicKey } from "o1js";

interface CustomWindow extends Window {
  mina?: any;
}

function connectMinaWallet() {
  if (
    typeof window !== "undefined" &&
    typeof (window as CustomWindow).mina !== "undefined"
  ) {
    console.log("Auro Wallet is installed!");
  }
}

async function getMinaNetwork() {
  const network = await (window as CustomWindow).mina.requestNetwork();
  return network;
}

async function requestMinaAccounts() {
  const account: string[] = await (window as CustomWindow).mina
    .requestAccounts()
    .catch((err: any) => err);
  return account;
}

export async function getMinaAccount() {
  connectMinaWallet();

  let account: string[] = await (window as CustomWindow).mina.getAccounts();
  if (account.length === 0) {
    account = await requestMinaAccounts();
    if (account.length === 0) {
      throw new Error("no account found");
    }
  }
  return account[0];
}

export async function getMinaPublicKey() {
  connectMinaWallet();

  let account: string[] = await (window as CustomWindow).mina.getAccounts();
  if (account.length === 0) {
    account = await requestMinaAccounts();
    if (account.length === 0) {
      throw new Error("no account found");
    }
  }
  return PublicKey.fromBase58(account[0]);
}

export async function setMinaAccount(key: string) {
  const account: string = await getMinaAccount();
  sessionStorage.setItem(key, account);
  return account;
}
