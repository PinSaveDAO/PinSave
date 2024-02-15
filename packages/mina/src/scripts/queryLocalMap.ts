import { createClient } from '@vercel/kv';
import dotenv from 'dotenv';

import { getMapFromVercelNfts, getVercelMetadata } from '../components/NFT.js';
import { getAppString } from '../components/transactions.js';

dotenv.config();

const client = createClient({
  url: process.env.KV_REST_API_URL as string,
  token: process.env.KV_REST_API_TOKEN as string,
});

const appId = getAppString();

const storedMap = await getMapFromVercelNfts(appId, [0, 1, 2], client);

console.log(storedMap.getRoot().toString());

console.log(await getVercelMetadata(appId, 0, client));
