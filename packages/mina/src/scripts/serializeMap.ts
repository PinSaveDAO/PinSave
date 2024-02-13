import { getVercelClient } from '../components/env.js';
import { getMapFromVercelNfts } from '../components/Nft.js';
import {
  startBerkeleyClient,
  getAppString,
} from '../components/transactions.js';
import {
  serializeMerkleMapToJson,
  deserializeJsonToMerkleMap,
} from '../components/serialize.js';

startBerkeleyClient();

const client = getVercelClient();

const appId = getAppString();

const storedMap = await getMapFromVercelNfts(appId, [0, 1, 2], client);

console.log(storedMap.getRoot().toString());

const data = serializeMerkleMapToJson(storedMap);

const map = deserializeJsonToMerkleMap(data);

console.log(map.getRoot().toString());
