import {
  deserializeNft,
  getMapFromVercelNfts,
  getVercelNft,
} from '../components/Nft.js';
import { mintNFTwithMapLive } from '../components/transactions.js';
import {
  getEnvAccount,
  getAppEnv,
  getVercelClient,
} from '../components/env.js';
import { startBerkeleyClient } from '../components/client.js';

const { pk: deployerKey } = getEnvAccount();
const { appId: appId, zkApp: zkApp } = getAppEnv();

startBerkeleyClient();

const client = getVercelClient();

const storedMap = await getMapFromVercelNfts(appId, [0, 1, 2], client);

const nft_ = await getVercelNft(appId, 1, client);

const nft = deserializeNft(nft_);

const compile = true;
const live = true;

await mintNFTwithMapLive(deployerKey, nft, zkApp, storedMap, compile, live);
