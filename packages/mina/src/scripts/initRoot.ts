import { generateDummyCollectionWithMap } from '../components/NFT/dummy.js';
import {
  getMapFromVercelNFTs,
  setNFTsToVercel,
  setMetadatasToVercel,
} from '../components/NFT/vercel.js';
import { startBerkeleyClient } from '../components/utilities/client.js';
import {
  getEnvAccount,
  getAppEnv,
  getVercelClient,
} from '../components/utilities/env.js';
import { generateIntegersArray } from '../components/utilities/helpers.js';
import { initRootWithCompile } from '../components/transactions.js';

startBerkeleyClient();
const client = getVercelClient();

const { pubKey: pubKey, adminPK: adminPK } = getEnvAccount();
const { appId: appId, zkApp: zkApp } = getAppEnv();

const {
  map: merkleMap,
  nftArray: nftArray,
  nftMetadata: nftMetadata,
} = generateDummyCollectionWithMap(pubKey);

const generateTreeRoot = merkleMap.getRoot().toString();

await setNFTsToVercel(appId, nftArray, client);
await setMetadatasToVercel(appId, nftMetadata, client);

const arrayLength = 3;
const arrayIds = generateIntegersArray(arrayLength);
const storedTree = await getMapFromVercelNFTs(appId, arrayIds, client);

const storedTreeRoot = storedTree.getRoot().toString();
console.log('matches subbed tree', storedTreeRoot === generateTreeRoot);

const compile = true;
const live = true;

await initRootWithCompile(
  adminPK,
  adminPK,
  merkleMap,
  zkApp,
  arrayLength,
  compile,
  live
);
