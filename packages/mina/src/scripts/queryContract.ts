import { startBerkeleyClient } from '../components/utilities/client.js';
import { getAppEnv } from '../components/utilities/env.js';
import { getMinaBalance } from '../components/TokenBalances.js';

startBerkeleyClient();

const { zkAppAddress: zkAppAddress } = getAppEnv();

console.log('app public key', zkAppAddress.toBase58());

console.log('mina balance', getMinaBalance(zkAppAddress));
