import {
  getAppContract,
  getAppString,
} from '../components/utilities/AppEnv.js';
import { startBerkeleyClient } from '../components/utilities/client.js';
import { getVercelClient } from '../components/utilities/env.js';
import { generateIntegersArray } from '../components/utilities/helpers.js';
import { getTotalInitedLive } from '../components/AppState.js';
import { getMapFromVercelNFTs } from '../components/NFT.js';
import {
  serializeMerkleMapToJson,
  deserializeJsonToMerkleMap,
} from '../components/serialize.js';

startBerkeleyClient();
const client = getVercelClient();

const appId = getAppString();

const app = getAppContract();
const totalInited = await getTotalInitedLive(app);
const array = generateIntegersArray(totalInited);

const storedMap = await getMapFromVercelNFTs(appId, array, client);

console.log(storedMap.getRoot().toString());

const data = serializeMerkleMapToJson(storedMap);

const map = deserializeJsonToMerkleMap(data);

console.log(map.getRoot().toString());
