import { startBerkeleyClient } from '../components/utilities/client.js';
import { getVercelClient, getAppEnv } from '../components/utilities/env.js';
import { generateIntegersArray } from '../components/utilities/helpers.js';
import {
  getTotalInitedLive,
  getTreeRootString,
} from '../components/AppState.js';
import {
  getMapFromVercelNFTs,
  getVercelMetadata,
  getVercelNFT,
} from '../components/NFT/vercel.js';
import { VercelKV } from '@vercel/kv';
import { MerkleMap } from 'o1js';

startBerkeleyClient();
const client: VercelKV = getVercelClient();
const { appId: appId, zkApp: zkApp } = getAppEnv();

const totalInited: number = await getTotalInitedLive(zkApp, true);
const array: number[] = generateIntegersArray(totalInited);

const storedMap: MerkleMap = await getMapFromVercelNFTs(appId, array, client);

console.log(storedMap.getRoot().toString());

const treeRoot: string = await getTreeRootString(zkApp);

console.log(
  storedMap.getRoot().toString() === treeRoot,
  'db matches on-chain root'
);

console.log(await getVercelNFT(appId, 0, client));
console.log(await getVercelMetadata(appId, 0, client));
