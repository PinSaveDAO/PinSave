import {
  getEnvAccount,
  getVercelClient,
  getAppEnv,
} from '../components/utilities/env.js';
import { initNFTLive } from '../components/transactions.js';
import {
  generateDummyCollectionWithMap,
  generateDummyNFT,
  setVercelNFT,
  setVercelMetadata,
} from '../components/NFT.js';
import { startBerkeleyClient } from '../components/utilities/client.js';

startBerkeleyClient();

const client = getVercelClient();
const { appId: appId, zkApp: zkApp } = getAppEnv();
const { pubKey: pubKey, pk: pk } = getEnvAccount();

const { map: merkleMap } = generateDummyCollectionWithMap(pubKey);

const { nftHashed: nftHashed, nftMetadata: nftMetadata } = generateDummyNFT(
  3,
  pubKey
);

const compile = true;

await initNFTLive(pubKey, pk, nftHashed, zkApp, merkleMap, compile);
await setVercelNFT(appId, nftHashed, client);
await setVercelMetadata(appId, nftMetadata, client);
