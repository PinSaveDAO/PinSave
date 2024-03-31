import { startBerkeleyClient } from '../src/components/utilities/client.js';
import {
  getEnvAccount,
  getAppEnv,
  getVercelClient,
} from '../src/components/utilities/env.js';
import { getAppVars } from '../src/components/utilities/AppEnv.js';
import {
  getTokenAddressBalance,
  getMinaBalance,
} from '../src/components/TokenBalances.js';
import { VercelKV } from '@vercel/kv';

describe('PinSave NFTs on Berkeley', () => {
  startBerkeleyClient();
  const client: VercelKV = getVercelClient();
  const { appContract, appPubString } = getAppVars();

  const { zkApp: zkApp } = getAppEnv();
  const { pubKey: pub } = getEnvAccount();

  it('queries PinSave NFTs balances', async () => {
    const tokenBalance = await getTokenAddressBalance(pub, zkApp.token.id);
    expect(tokenBalance).toBeGreaterThanOrEqual(0n);
  });

  it('queries Mina balance', async () => {
    const tokenBalance = getMinaBalance(pub);
    expect(tokenBalance).toBeGreaterThanOrEqual(0n);
  });
});
