import { initNft } from '../components/transactions.js';
import {
  generateDummyCollectionWithMap,
  generateDummyNft,
  setVercelNft,
} from '../components/NFT.js';
import {
  getEnvAccount,
  startBerkeleyClient,
  getAppPublic,
} from '../components/transactions.js';
import { MerkleMapContract } from '../NFTsMapContract.js';
import { createClient } from '@vercel/kv';
import { Field } from 'o1js';

startBerkeleyClient();

const client = createClient({
  url: process.env.KV_REST_API_URL as string,
  token: process.env.KV_REST_API_TOKEN as string,
});

const { pk: pk } = getEnvAccount();
const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();

const { map: merkleMap } = generateDummyCollectionWithMap(pubKey);

const nft = generateDummyNft(13, pubKey);

const zkApp: MerkleMapContract = new MerkleMapContract(zkAppAddress);

await initNft(pubKey, pk, nft, zkApp, merkleMap);

await setVercelNft(Field(13), client, nft);
