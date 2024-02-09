import { logAppStatesContract } from '../components/AppState.js';
import {
  startBerkeleyClient,
  getAppPublic,
} from '../components/transactions.js';

startBerkeleyClient();

const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();

console.log('deployer public key', pubKey.toBase58());
console.log('app public key', zkAppAddress.toBase58());

logAppStatesContract(zkAppAddress);
