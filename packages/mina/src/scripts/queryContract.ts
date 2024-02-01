import { createClient } from '@vercel/kv';

import { logAppStatesContract } from '../components/AppState.js';
import { getMapFromVercelNfts } from '../components/Nft.js';
import {
  startBerkeleyClient,
  getAppPublic,
} from '../components/transactions.js';

startBerkeleyClient();

const client = createClient({
  url: process.env.KV_REST_API_URL as string,
  token: process.env.KV_REST_API_TOKEN as string,
});

const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();

console.log('deployer key', pubKey.toBase58());

logAppStatesContract(zkAppAddress);

const storedMap = await getMapFromVercelNfts([10, 11, 12, 13], client);

console.log(storedMap.getRoot().toString());
