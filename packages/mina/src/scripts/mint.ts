import {
  deserializeNFT,
  getMapFromVercelNFTs,
  getVercelNFT,
} from '../components/NFT.js';
import { mintNFTwithMapLive } from '../components/transactions.js';
import {
  getEnvAccount,
  getAppEnv,
  getVercelClient,
} from '../components/utilities/env.js';
import { startBerkeleyClient } from '../components/utilities/client.js';

const { pk: deployerKey } = getEnvAccount();
const { appId: appId, zkApp: zkApp } = getAppEnv();

startBerkeleyClient();

const client = getVercelClient();

const storedMap = await getMapFromVercelNFTs(appId, [0, 1, 2], client);

const nft_ = await getVercelNFT(appId, 1, client);

const nft = deserializeNFT(nft_);

const compile = true;
const live = true;

await mintNFTwithMapLive(deployerKey, nft, zkApp, storedMap, compile, live);
