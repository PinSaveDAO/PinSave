import { getEnvAccount, getVercelClient, getAppEnv } from '../components/env.js';
import { initNft } from '../components/transactions.js';
import {
  generateDummyCollectionWithMap,
  generateDummyNft,
  setVercelNft,
} from '../components/Nft.js';
import {
  startBerkeleyClient,
} from '../components/transactions.js';

startBerkeleyClient();

const client = getVercelClient()
const { appId: appId, zkApp: zkApp } = getAppEnv();
const { pubKey: pubKey, pk: pk } = getEnvAccount();

const { map: merkleMap } = generateDummyCollectionWithMap(pubKey);

const nft = generateDummyNft(0, pubKey);

await initNft(pubKey, pk, nft, zkApp, merkleMap);
await setVercelNft(appId, client, nft);
