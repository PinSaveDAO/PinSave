import { createClient } from '@vercel/kv';

import { getMapFromVercelNfts } from '../components/Nft.js';
import { getAppPublic } from '../components/transactions.js';

const client = createClient({
  url: process.env.KV_REST_API_URL as string,
  token: process.env.KV_REST_API_TOKEN as string,
});

const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();
const storedMap = await getMapFromVercelNfts(zkAppAddress, [0, 1], client);

console.log(storedMap.getRoot().toString());
