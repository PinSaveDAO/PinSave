import { Mina, PublicKey, PrivateKey } from 'o1js';

export function startBerkeleyClient(
  endpoint: string = 'https://mina-berkeley-graphql.aurowallet.com/graphql'
): void {
  const Berkeley = Mina.Network(endpoint);
  Mina.setActiveInstance(Berkeley);
}

export function startLocalBlockchainClient(
  proofsEnabled: boolean = false,
  enforceTransactionLimits: boolean = false
): {
  publicKey: PublicKey;
  privateKey: PrivateKey;
}[] {
  const Local = Mina.LocalBlockchain({
    proofsEnabled: proofsEnabled,
    enforceTransactionLimits: enforceTransactionLimits,
  });

  Mina.setActiveInstance(Local);
  const accounts = Local.testAccounts;
  return accounts;
}
