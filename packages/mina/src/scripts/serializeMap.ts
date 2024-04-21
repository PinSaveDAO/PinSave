import type { VercelKV } from '@vercel/kv';
import { MerkleMap } from 'o1js';

import { getAppEnv, getVercelClient } from '../components/utilities/env.js';
import { startBerkeleyClient } from '../components/utilities/client.js';
import { generateIntegersArray } from '../components/utilities/helpers.js';
import { getTotalInitedLive } from '../components/AppState.js';
import { getMapFromVercelNFTs } from '../components/Vercel/VercelMap.js';
import {
  serializeMerkleMapToJson,
  deserializeJsonToMerkleMap,
} from '../components/serialize.js';

startBerkeleyClient();
const client: VercelKV = getVercelClient();

const { appId, zkApp } = getAppEnv();

const totalInited: number = await getTotalInitedLive(zkApp);
const array: number[] = generateIntegersArray(totalInited);

const storedMap: MerkleMap = await getMapFromVercelNFTs(appId, array, client);

console.log(storedMap.getRoot().toString());

const data: string = serializeMerkleMapToJson(storedMap);

const map: MerkleMap = deserializeJsonToMerkleMap(data);

console.log(map.getRoot().toString());
