import { getAppString } from '../components/AppEnv.js';
import { getVercelClient } from '../components/env.js';
import { getMapFromVercelNfts, getVercelMetadata } from '../components/Nft.js';

const client = getVercelClient();
const appId = getAppString();

const storedMap = await getMapFromVercelNfts(appId, [0, 1, 2], client);

console.log(storedMap.getRoot().toString());
console.log(await getVercelMetadata(appId, 0, client));
