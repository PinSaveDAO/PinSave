import { startBerkeleyClient } from '../components/utilities/client.js';
import { getEnvAccount, getAppEnv } from '../components/utilities/env.js';
import { getTokenAddressBalance } from '../components/TokenBalances.js';

startBerkeleyClient();

const { zkApp: zkApp } = getAppEnv();
const { pubKey: pub } = getEnvAccount();

const tokenBalance = await getTokenAddressBalance(pub, zkApp.token.id);

console.log('PinSave token balance:', tokenBalance);

const minaTokenBalance = await getTokenAddressBalance(pub);

console.log('Mina token balance:', minaTokenBalance);
