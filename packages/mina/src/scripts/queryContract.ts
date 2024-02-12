import { logAppStatesContract } from '../components/AppState.js';
import {
  startBerkeleyClient,
  getAppPublic,
} from '../components/transactions.js';

startBerkeleyClient();

const zkAppAddress = getAppPublic();

console.log('app public key', zkAppAddress.toBase58());

logAppStatesContract(zkAppAddress);
