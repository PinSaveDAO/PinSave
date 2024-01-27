import { initRootWithApp } from '../components/transactions.js';
import {
  generateDummyCollectionWithMap,
  setMapFromVercel,
  setNftsToVercel,
} from '../components/NFT.js';

import {
  getEnvAccount,
  startBerkeleyClient,
  getAppPublic,
} from '../components/transactions.js';

import { createClient } from '@vercel/kv';

startBerkeleyClient();

const { pk: deployerKey } = getEnvAccount();
const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();

const { map: merkleMap, nftArray: nftArray } =
  generateDummyCollectionWithMap(pubKey);

const generateTreeRoot = merkleMap.getRoot().toString();

console.log(generateTreeRoot);

const client = createClient({
  url: process.env.KV_REST_API_URL as string,
  token: process.env.KV_REST_API_TOKEN as string,
});

await setNftsToVercel(nftArray.nftArray, client);

const storedTree = await setMapFromVercel([10, 11, 12], client);

const storedTreeRoot = storedTree.getRoot().toString();

console.log(storedTreeRoot);

console.log('matches subbed tree', storedTreeRoot === generateTreeRoot);

//await initRootWithApp(deployerKey, zkAppAddress, merkleMap);
