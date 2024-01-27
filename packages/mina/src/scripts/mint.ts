import { mintNftFromMap } from '../components/transactions.js';
import {
  deserializeNft,
  getMapFromVercelNfts,
  getVercelNft,
} from '../components/NFT.js';
import {
  getEnvAccount,
  startBerkeleyClient,
  getAppPublic,
} from '../components/transactions.js';
import { MerkleMapContract } from '../NFTsMapContract.js';

import { createClient } from '@vercel/kv';

startBerkeleyClient();

const client = createClient({
  url: process.env.KV_REST_API_URL as string,
  token: process.env.KV_REST_API_TOKEN as string,
});

const { pk: deployerKey } = getEnvAccount();
const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();
const zkApp: MerkleMapContract = new MerkleMapContract(zkAppAddress);

const storedMap = await getMapFromVercelNfts([10, 11, 12], client);

console.log(storedMap.getRoot().toString());

const nft_ = await getVercelNft(11, client);

const nft = deserializeNft(nft_);

await mintNftFromMap(deployerKey, nft, zkApp, storedMap);
