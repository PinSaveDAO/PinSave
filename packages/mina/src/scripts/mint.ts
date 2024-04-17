import type { VercelKV } from '@vercel/kv';
import { MerkleMap } from 'o1js';

import { startBerkeleyClient } from '../components/utilities/client.js';
import {
  getEnvAccount,
  getAppEnv,
  getVercelClient,
} from '../components/utilities/env.js';
import { generateIntegersArray } from '../components/utilities/helpers.js';
import { getTotalInitedLive } from '../components/AppState.js';
import {
  NFTSerializedData,
  deserializeNFT,
} from '../components/NFT/deserialization.js';
import { NFT } from '../components/NFT/NFT.js';
import {
  getVercelNFT,
  mintVercelNFT,
  mintVercelMetadata,
} from '../components/Vercel/vercel.js';
import { getMapFromVercelNFTs } from '../components/Vercel/VercelMap.js';
import { mintNFTwithMap } from '../components/transactions.js';

startBerkeleyClient();
const client: VercelKV = getVercelClient();

const nftId: number = 1;

const { adminPK: adminPK } = getEnvAccount();
const { appId: appId, zkApp: zkApp } = getAppEnv();

const totalInited: number = await getTotalInitedLive(zkApp);
const array: number[] = generateIntegersArray(totalInited);
const storedMap: MerkleMap = await getMapFromVercelNFTs(appId, array, client);

const nft_: NFTSerializedData = await getVercelNFT(appId, nftId, client);
const nft: NFT = deserializeNFT(nft_);

const compile: boolean = true;
const live: boolean = true;

await mintNFTwithMap(adminPK, adminPK, nft, zkApp, storedMap, compile, live);

await mintVercelNFT(appId, nftId, client);
await mintVercelMetadata(appId, nftId, client);
