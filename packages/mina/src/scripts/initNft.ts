import { createClient } from '@vercel/kv';

import { getEnvAccount } from '../components/env.js';
import { initNft } from '../components/transactions.js';
import {
  generateDummyCollectionWithMap,
  generateDummyNft,
  setVercelNft,
} from '../components/Nft.js';
import {
  startBerkeleyClient,
  getAppPublic,
} from '../components/transactions.js';
import { MerkleMapContract } from '../NFTsMapContract.js';

startBerkeleyClient();

const client = createClient({
  url: process.env.KV_REST_API_URL as string,
  token: process.env.KV_REST_API_TOKEN as string,
});

const { pubKey: pubKey, pk: pk } = getEnvAccount();
const zkAppAddress = getAppPublic();

const { map: merkleMap } = generateDummyCollectionWithMap(pubKey);

const nft = generateDummyNft(0, pubKey);

const zkApp: MerkleMapContract = new MerkleMapContract(zkAppAddress);

await initNft(pubKey, pk, nft, zkApp, merkleMap);

await setVercelNft(zkAppAddress, client, nft);
