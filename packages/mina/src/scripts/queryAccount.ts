import { startBerkeleyClient } from '../components/utilities/client.js';
import { getEnvAccount, getAppEnv } from '../components/utilities/env.js';
import { getTokenIdBalance } from '../components/TokenBalances.js';

startBerkeleyClient();

const { zkApp: zkApp } = getAppEnv();
const { pubKey: pub } = getEnvAccount();

const tokenBalance = await getTokenIdBalance(pub, zkApp.token.id);

console.log('PinSave token balance:', tokenBalance);

const minaTokenBalance = await getTokenIdBalance(pub);

console.log('Mina token balance:', minaTokenBalance);
