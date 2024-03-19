import { startBerkeleyClient } from '../components/utilities/client.js';
import { getVercelClient, getAppEnv } from '../components/utilities/env.js';
import { generateIntegersArray } from '../components/utilities/helpers.js';
import { getTotalInitedLive } from '../components/AppState.js';
import {
  getMapFromVercelNFTs,
  getVercelMetadata,
  getVercelCommentsPostLength,
  getVercelPostComments,
} from '../components/NFT/vercel.js';

startBerkeleyClient();
const client = getVercelClient();

const { appId: appId, zkApp: zkApp } = getAppEnv();

const totalInited = await getTotalInitedLive(zkApp);
const array = generateIntegersArray(totalInited);

const storedMap = await getMapFromVercelNFTs(appId, array, client);

console.log(storedMap.getRoot().toString());
console.log(await getVercelMetadata(appId, 4, client));

console.log(await getVercelCommentsPostLength(appId, 2, client));
console.log(await getVercelPostComments(appId, 2, client));
