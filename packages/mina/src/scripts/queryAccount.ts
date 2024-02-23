import { fetchAccount } from 'o1js';

import {
  startBerkeleyClient,
} from '../components/transactions.js';
import { getEnvAccount, getAppEnv } from '../components/env.js';
import {
  logMinaBalance,
  logTokenBalances,
} from '../components/TokenBalances.js';

startBerkeleyClient();

const { zkApp: zkApp } = getAppEnv();
const { pubKey: pub } = getEnvAccount();

await fetchAccount({ publicKey: pub });

logMinaBalance(pub);
logTokenBalances(pub, zkApp);
