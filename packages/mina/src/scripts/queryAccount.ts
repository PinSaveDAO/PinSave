import {
  startBerkeleyClient,
} from '../components/transactions.js';
import { getEnvAccount, getAppEnv } from '../components/env.js';
import { getTokenIdBalance } from '../components/TokenBalances.js';

startBerkeleyClient();

const { zkApp: zkApp } = getAppEnv();
const { pubKey: pub } = getEnvAccount();

const tokenBalance = await getTokenIdBalance(pub, zkApp.token.id) 

console.log("PinSave token balance:",  tokenBalance / 1_000_000_000n)

const minaTokenBalance = await getTokenIdBalance(pub)

console.log("Mina token balance:",  Number(minaTokenBalance) / 1_000_000_000)

