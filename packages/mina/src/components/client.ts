import {
    Mina,
  } from 'o1js';

export function startBerkeleyClient(
    endpoint: string = 'https://mina-berkeley-graphql.aurowallet.com/graphql'
  ) {
    const Berkeley = Mina.Network(endpoint);
    Mina.setActiveInstance(Berkeley);
  }
  
export async function startLocalBlockchainClient(
    proofsEnabled: boolean = false,
    enforceTransactionLimits: boolean = false
  ) {
    const Local = Mina.LocalBlockchain({
      proofsEnabled: proofsEnabled,
      enforceTransactionLimits: enforceTransactionLimits,
    });
  
    Mina.setActiveInstance(Local);
    const accounts = Local.testAccounts;
    return accounts;
  }
  