import { getEnvAccount,  getAppEnv, getVercelClient } from '../components/env.js';
import {
  generateDummyCollectionWithMap,
  getMapFromVercelNfts,
  setNftsToVercel,
  setMetadatasToVercel,
} from '../components/Nft.js';
import {
  initRootWithApp,
  startBerkeleyClient,
} from '../components/transactions.js';

startBerkeleyClient();
const client = getVercelClient()
const { pubKey: pubKey, pk: deployerKey } = getEnvAccount();
const { appId: appId, pk: zkAppPK } = getAppEnv();

const {
  map: merkleMap,
  nftArray: nftArray,
  nftMetadata: nftMetadata,
} = generateDummyCollectionWithMap(pubKey);

const generateTreeRoot = merkleMap.getRoot().toString();

await setNftsToVercel(appId, nftArray, client);
await setMetadatasToVercel(appId, nftMetadata, client);

const storedTree = await getMapFromVercelNfts(appId, [0, 1, 2], client);

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
