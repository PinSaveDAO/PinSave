import { fetchAccount } from 'o1js';

import {
  getAppContract,
  startBerkeleyClient,
} from '../components/transactions.js';
import { getEnvAccount } from '../components/env.js';
import {
  logMinaBalance,
  logTokenBalances,
} from '../components/TokenBalances.js';

startBerkeleyClient();

const contract = getAppContract();

const { pubKey: pub } = getEnvAccount();

await fetchAccount({ publicKey: pub });

logMinaBalance(pub);

logTokenBalances(pub, contract);
