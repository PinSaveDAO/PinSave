import { createClient } from '@vercel/kv';

import {
  deserializeNft,
  getMapFromVercelNfts,
  getVercelNft,
} from '../components/Nft.js';
import {
  mintNftFromMap,
  startBerkeleyClient,
  getAppString,
  getAppContract,
} from '../components/transactions.js';

import { getEnvAccount } from '../components/env.js';

const { pk: deployerKey } = getEnvAccount();
startBerkeleyClient();

const client = createClient({
  url: process.env.KV_REST_API_URL as string,
  token: process.env.KV_REST_API_TOKEN as string,
});

const appId = getAppString();
const zkApp = getAppContract();

const storedMap = await getMapFromVercelNfts(appId, [0, 1, 2], client);

console.log(storedMap.getRoot().toString());

const nft_ = await getVercelNft(appId, 11, client);

const nft = deserializeNft(nft_);

await mintNftFromMap(deployerKey, nft, zkApp, storedMap);
