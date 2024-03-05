import { startBerkeleyClient } from '../components/utilities/client.js';
import {
  getEnvAccount,
  getAppEnv,
  getVercelClient,
} from '../components/utilities/env.js';
import { generateIntegersArray } from '../components/utilities/helpers.js';
import { getTotalInitedLive } from '../components/AppState.js';
import {
  deserializeNFT,
  getMapFromVercelNFTs,
  getVercelNFT,
} from '../components/NFT.js';
import { mintNFTwithMap } from '../components/transactions.js';

startBerkeleyClient();
const client = getVercelClient();

const { pk: deployerKey } = getEnvAccount();
const { zkAppPK: zkAppPK, appId: appId, zkApp: zkApp } = getAppEnv();

const totalInited = await getTotalInitedLive(zkApp);
const array = generateIntegersArray(totalInited);
const storedMap = await getMapFromVercelNFTs(appId, array, client);

const nft_ = await getVercelNFT(appId, 1, client);

const nft = deserializeNFT(nft_);

const compile = true;
const live = true;

await mintNFTwithMap(
  zkAppPK,
  deployerKey,
  nft,
  zkApp,
  storedMap,
  compile,
  live
);
