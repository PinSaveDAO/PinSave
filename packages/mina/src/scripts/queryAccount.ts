import { startBerkeleyClient } from '../components/utilities/client.js';
import { getEnvAccount, getAppEnv } from '../components/utilities/env.js';
import { getTokenAddressBalance } from '../components/TokenBalances.js';

startBerkeleyClient();

const { zkApp: zkApp } = getAppEnv();
const { adminPubKey: pub } = getEnvAccount();

const tokenBalance: bigint = await getTokenAddressBalance(pub, zkApp.token.id);

console.log('PinSave token balance:', tokenBalance);

const minaTokenBalance: bigint = await getTokenAddressBalance(pub);

console.log('Mina token balance:', minaTokenBalance);
