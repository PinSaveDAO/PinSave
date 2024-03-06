import { startBerkeleyClient } from '../components/utilities/client.js';
import {
  getEnvAccount,
  getAppEnv,
  getVercelClient,
} from '../components/utilities/env.js';
import { generateDummyCollectionWithMap } from '../components/NFT/dummy.js';
import {
  getMapFromVercelNFTs,
  setNFTsToVercel,
  setMetadatasToVercel,
} from '../components/NFT/vercel.js';
import { initRootWithApp } from '../components/transactions.js';

startBerkeleyClient();
const client = getVercelClient();

const { pubKey: pubKey, pk: deployerKey } = getEnvAccount();
const { appId: appId, zkAppPK: zkAppPK } = getAppEnv();

const {
  map: merkleMap,
  nftArray: nftArray,
  nftMetadata: nftMetadata,
} = generateDummyCollectionWithMap(pubKey);

const generateTreeRoot = merkleMap.getRoot().toString();

await setNFTsToVercel(appId, nftArray, client);
await setMetadatasToVercel(appId, nftMetadata, client);

const storedTree = await getMapFromVercelNFTs(appId, [0, 1, 2], client);

const storedTreeRoot = storedTree.getRoot().toString();

console.log('matches subbed tree', storedTreeRoot === generateTreeRoot);

const compile = true;
const live = true;

await initRootWithApp(
  zkAppPK,
  deployerKey,
  merkleMap,
  nftArray.length,
  compile,
  live
);
