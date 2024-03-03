import { logAppStatesContract } from '../components/AppState.js';
import { startBerkeleyClient } from '../components/utilities/client.js';
import { logMinaBalance } from '../components/TokenBalances.js';
import { getAppEnv } from '../components/utilities/env.js';

startBerkeleyClient();

const { zkAppAddress: zkAppAddress } = getAppEnv();

console.log('app public key', zkAppAddress.toBase58());

logAppStatesContract(zkAppAddress);
logMinaBalance(zkAppAddress);
