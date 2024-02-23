import {
  deserializeNft,
  getMapFromVercelNfts,
  getVercelNft,
} from '../components/Nft.js';
import {
  mintNftFromMap,
} from '../components/transactions.js';
import { getEnvAccount, getAppEnv, getVercelClient } from '../components/env.js';
import {
  startBerkeleyClient,
} from '../components/client.js';

const { pk: deployerKey } = getEnvAccount();
const { appId: appId, zkApp: zkApp } = getAppEnv();

startBerkeleyClient();

const client = getVercelClient()

const storedMap = await getMapFromVercelNfts(appId, [0, 1, 2], client);

const nft_ = await getVercelNft(appId, 0, client);

const nft = deserializeNft(nft_);

const compile = true;
const live = true;
const displayLogs = false;

await mintNftFromMap(
  deployerKey,
  nft,
  zkApp,
  storedMap,
 compile,
 live,
 displayLogs
);
