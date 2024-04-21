import { VercelKV } from '@vercel/kv';
import { fetchAccount } from 'o1js';

import { generateDummyCollectionWithMap } from '../components/NFT/dummy.js';
import {
  setNFTsToVercel,
  setMetadatasToVercel,
} from '../components/Vercel/vercel.js';
import { startBerkeleyClient } from '../components/utilities/client.js';
import {
  getEnvAccount,
  getAppEnv,
  getVercelClient,
} from '../components/utilities/env.js';
import { TxStatus, initRootWithCompile } from '../components/transactions.js';

startBerkeleyClient();
const client: VercelKV = getVercelClient();

const { adminPubKey, adminPK } = getEnvAccount();
const { appId, zkApp } = getAppEnv();

const arrayLength: number = 1;

const {
  map: merkleMap,
  nftArray,
  nftMetadata,
} = generateDummyCollectionWithMap(adminPubKey, arrayLength);

const compile: boolean = true;
const live: boolean = true;

await fetchAccount({ publicKey: zkApp.address });

const txStatus: TxStatus = await initRootWithCompile(
  adminPK,
  adminPK,
  merkleMap,
  zkApp,
  arrayLength,
  compile,
  live
);

if (txStatus === 'included') {
  await setNFTsToVercel(appId, nftArray, client);
  await setMetadatasToVercel(appId, nftMetadata, client);
}
