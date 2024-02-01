import { createClient } from '@vercel/kv';

import {
  generateDummyCollectionWithMap,
  getMapFromVercelNfts,
  setNftsToVercel,
  setMetadatasToVercel,
} from '../components/Nft.js';
import {
  initRootWithApp,
  getEnvAccount,
  startBerkeleyClient,
  getAppPublic,
} from '../components/transactions.js';

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
await setMetadatasToVercel(nftArray.nftMetadata, client);

const storedTree = await getMapFromVercelNfts([10, 11, 12], client);

const storedTreeRoot = storedTree.getRoot().toString();

console.log(storedTreeRoot);

console.log('matches subbed tree', storedTreeRoot === generateTreeRoot);

await initRootWithApp(
  deployerKey,
  zkAppAddress,
  merkleMap,
  nftArray.nftArray.length
);
