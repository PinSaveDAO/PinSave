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
  console.log(network);
}

async function requestMinaAccounts() {
  const account: string[] = await (window as CustomWindow).mina
    .requestAccounts()
    .catch((err: any) => err);
  return account;
}

export async function getMinaAccount() {
  connectMinaWallet();

  let account = await (window as CustomWindow).mina.getAccounts();
  if (account.len === 0) {
    account = requestMinaAccounts();
  }
  console.log(account);
}
