import { startBerkeleyClient } from '../components/utilities/client.js';
import { getAppEnv } from '../components/utilities/env.js';
import { getMinaBalance } from '../components/TokenBalances.js';
import { getTotalInitedLive } from '../components/AppState.js';

startBerkeleyClient();

const { zkAppAddress: zkAppAddress, zkApp: zkApp } = getAppEnv();

console.log('app public key', zkAppAddress.toBase58());

console.log('contract: mina balance', getMinaBalance(zkAppAddress));

const totalInited: number = await getTotalInitedLive(zkApp);

console.log('contract: total inited', totalInited);
