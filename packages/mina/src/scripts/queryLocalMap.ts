import { createClient } from '@vercel/kv';
import { getMapFromVercelNfts } from '../components/Nft.js';

const client = createClient({
  url: process.env.KV_REST_API_URL as string,
  token: process.env.KV_REST_API_TOKEN as string,
});

const storedMap = await getMapFromVercelNfts([0, 1], client);

console.log(storedMap.getRoot().toString());
