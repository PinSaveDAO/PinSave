import { getAppString } from '../components/AppEnv.js';
import { getVercelClient } from '../components/env.js';
import { getMapFromVercelNFTs, getVercelMetadata } from '../components/NFT.js';

const client = getVercelClient();
const appId = getAppString();

const storedMap = await getMapFromVercelNFTs(appId, [0, 1, 2, 3], client);

console.log(storedMap.getRoot().toString());
console.log(await getVercelMetadata(appId, 3, client));
