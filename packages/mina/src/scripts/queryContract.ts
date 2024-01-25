import { logAppStatesContract } from '../components/AppState.js';
import {
  startBerkeleyClient,
  getAppPublic,
} from '../components/transactions.js';

startBerkeleyClient();

const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();

console.log('deployer key', pubKey.toBase58());

logAppStatesContract(zkAppAddress);
