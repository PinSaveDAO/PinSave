import type { VercelKV } from '@vercel/kv';
import { MerkleMap, PrivateKey, PublicKey } from 'o1js';

import { startBerkeleyClient } from '../components/utilities/client.js';
import {
  getEnvAccount,
  getVercelClient,
  getAppEnv,
} from '../components/utilities/env.js';
import { generateIntegersArrayIncluding } from '../components/utilities/helpers.js';
import { getTotalInitedLive } from '../components/AppState.js';
import { generateDummyNFT } from '../components/NFT/dummy.js';
import {
  setVercelNFT,
  setVercelMetadata,
} from '../components/Vercel/vercel.js';
import { getMapFromVercelNFTs } from '../components/Vercel/VercelMap.js';
import { initNFT } from '../components/transactions.js';

startBerkeleyClient();
const client: VercelKV = getVercelClient();

const { appId: appId, zkApp: zkApp } = getAppEnv();
const { adminPK: adminPk } = getEnvAccount();

const userPK: PrivateKey = PrivateKey.fromBase58(process.env.userpk as string);
const userPub: PublicKey = userPK.toPublicKey();

const totalInited: number = await getTotalInitedLive(zkApp);
const array: number[] = generateIntegersArrayIncluding(totalInited);
const storedMap: MerkleMap = await getMapFromVercelNFTs(appId, array, client);

const { nftArray: nftArray, nftMetadata: nftMetadata } = generateDummyNFT(
  totalInited,
  userPub
);

const compile: boolean = true;

await initNFT(adminPk, userPK, nftArray, zkApp, storedMap, compile);
await setVercelNFT(appId, nftArray, client);
await setVercelMetadata(appId, nftMetadata, client);
