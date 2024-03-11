import { startBerkeleyClient } from '../components/utilities/client.js';
import {
  getEnvAccount,
  getAppEnv,
  getVercelClient,
} from '../components/utilities/env.js';
import { generateIntegersArray } from '../components/utilities/helpers.js';
import { getTotalInitedLive } from '../components/AppState.js';
import { deserializeNFT } from '../components/NFT/deserialization.js';
import {
  getMapFromVercelNFTs,
  getVercelNFT,
  mintVercelNFT,
  mintVercelMetadata,
} from '../components/NFT/vercel.js';
import { mintNFTwithMap } from '../components/transactions.js';

startBerkeleyClient();
const client = getVercelClient();

const nftId = 0;

const { adminPK: adminPK } = getEnvAccount();
const { appId: appId, zkApp: zkApp } = getAppEnv();

const totalInited = await getTotalInitedLive(zkApp);
const array = generateIntegersArray(totalInited);
const storedMap = await getMapFromVercelNFTs(appId, array, client);

const nft_ = await getVercelNFT(appId, nftId, client);
const nft = deserializeNFT(nft_);

const compile = true;
const live = true;

await mintNFTwithMap(adminPK, adminPK, nft, zkApp, storedMap, compile, live);

await mintVercelNFT(appId, nftId, client);
await mintVercelMetadata(appId, nftId, client);
