import { startBerkeleyClient } from '../components/utilities/client.js';
import { getAppEnv } from '../components/utilities/env.js';
import { getMinaBalance } from '../components/TokenBalances.js';
import {
  getTotalInitedLive,
  getTreeRootString,
} from '../components/AppState.js';

startBerkeleyClient();

const { zkAppAddress, zkApp } = getAppEnv();

console.log('app public key', zkAppAddress.toBase58());

console.log('contract: mina balance', getMinaBalance(zkAppAddress));

const totalInited: number = await getTotalInitedLive(zkApp, true);
console.log('contract: total inited', totalInited);

const root: string = await getTreeRootString(zkApp, false);
console.log('root:', root);
