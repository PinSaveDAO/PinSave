import { startBerkeleyClient } from '../components/utilities/client.js';
import {
  getEnvAccount,
  getVercelClient,
  getAppEnv,
} from '../components/utilities/env.js';
import { generateIntegersArray } from '../components/utilities/helpers.js';
import { getTotalInitedLive } from '../components/AppState.js';
import {
  generateDummyNFT,
  setVercelNFT,
  setVercelMetadata,
  getMapFromVercelNFTs,
} from '../components/NFT.js';
import { initNFT } from '../components/transactions.js';

startBerkeleyClient();
const client = getVercelClient();

const { appId: appId, zkApp: zkApp, zkAppPK: zkAppPk } = getAppEnv();
const { pubKey: pubKey, pk: pk } = getEnvAccount();

const totalInited = await getTotalInitedLive(zkApp);
const array = generateIntegersArray(totalInited);
const storedMap = await getMapFromVercelNFTs(appId, array, client);

const { nftHashed: nftHashed, nftMetadata: nftMetadata } = generateDummyNFT(
  totalInited,
  pubKey
);

const compile = true;

await initNFT(zkAppPk, pubKey, pk, nftHashed, zkApp, storedMap, compile);
await setVercelNFT(appId, nftHashed, client);
await setVercelMetadata(appId, nftMetadata, client);
