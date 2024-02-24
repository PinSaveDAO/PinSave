import { getAppString } from '../components/AppEnv.js';
import { startBerkeleyClient } from '../components/client.js';
import { getVercelClient } from '../components/env.js';
import { getMapFromVercelNFTs } from '../components/NFT.js';
import {
  serializeMerkleMapToJson,
  deserializeJsonToMerkleMap,
} from '../components/serialize.js';

startBerkeleyClient();

const client = getVercelClient();

const appId = getAppString();

const storedMap = await getMapFromVercelNFTs(appId, [0, 1, 2], client);

console.log(storedMap.getRoot().toString());

const data = serializeMerkleMapToJson(storedMap);

const map = deserializeJsonToMerkleMap(data);

console.log(map.getRoot().toString());
