import type { VercelKV } from '@vercel/kv';
import { MerkleMap } from 'o1js';

import { startBerkeleyClient } from '../components/utilities/client.js';
import { getVercelClient, getAppEnv } from '../components/utilities/env.js';
import { generateIntegersArray } from '../components/utilities/helpers.js';
import {
  getTotalInitedLive,
  getTreeRootString,
} from '../components/AppState.js';
import { getMapFromVercelNFTs } from '../components/Vercel/VercelMap.js';
import { validateTreeInited } from '../components/Vercel/validateTree.js';

startBerkeleyClient();
const client: VercelKV = getVercelClient();
const { appId, zkApp } = getAppEnv();

const totalInited: number = await getTotalInitedLive(zkApp, true);

await validateTreeInited(client);

const array: number[] = generateIntegersArray(totalInited);
const storedMap: MerkleMap = await getMapFromVercelNFTs(appId, array, client);
const storedMapRoot: string = storedMap.getRoot().toString();
const treeRoot: string = await getTreeRootString(zkApp);
console.log(storedMapRoot === treeRoot, 'db matches on-chain root');
