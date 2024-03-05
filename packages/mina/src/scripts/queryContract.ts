import { startBerkeleyClient } from '../components/utilities/client.js';
import { getAppEnv } from '../components/utilities/env.js';
import { logAppStatesContract } from '../components/AppState.js';
import { logMinaBalance } from '../components/TokenBalances.js';

startBerkeleyClient();

const { zkAppAddress: zkAppAddress } = getAppEnv();

console.log('app public key', zkAppAddress.toBase58());

logAppStatesContract(zkAppAddress);
logMinaBalance(zkAppAddress);
