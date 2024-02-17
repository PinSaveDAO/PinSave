import { createClient } from '@vercel/kv';

import { getEnvAccount } from '../components/env';
import {
  generateDummyCollectionWithMap,
  getMapFromVercelNfts,
  setNftsToVercel,
  setMetadatasToVercel,
} from '../components/Nft.js';
import {
  initRootWithApp,
  startBerkeleyClient,
  getAppPublic,
} from '../components/transactions.js';

startBerkeleyClient();

const { pubKey: pubKey, pk: deployerKey } = getEnvAccount();
const zkAppAddress = getAppPublic();

const {
  map: merkleMap,
  nftArray: nftArray,
  nftMetadata: nftMetadata,
} = generateDummyCollectionWithMap(pubKey);

const generateTreeRoot = merkleMap.getRoot().toString();

console.log(generateTreeRoot);

const client = createClient({
  url: process.env.KV_REST_API_URL as string,
  token: process.env.KV_REST_API_TOKEN as string,
});

const appId = zkAppAddress.toBase58();

await setNftsToVercel(appId, nftArray, client);
await setMetadatasToVercel(appId, nftMetadata, client);

const storedTree = await getMapFromVercelNfts(appId, [0, 1, 2], client);

const storedTreeRoot = storedTree.getRoot().toString();

console.log(storedTreeRoot);

console.log('matches subbed tree', storedTreeRoot === generateTreeRoot);

await initRootWithApp(deployerKey, zkAppAddress, merkleMap, nftArray.length);
