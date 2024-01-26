import { initRootWithApp } from '../components/transactions.js';
import {
  generateDummyCollectionWithMap,
  NFTtoHash,
  NftReduced,
} from '../components/NFT.js';

import {
  getEnvAccount,
  startBerkeleyClient,
  getAppPublic,
} from '../components/transactions.js';

import { createClient } from '@vercel/kv';
import { MerkleMap, Field, PublicKey } from 'o1js';

startBerkeleyClient();

const { pk: deployerKey } = getEnvAccount();
const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();

const { map: merkleMap, nftArray: nftArray } =
  generateDummyCollectionWithMap(pubKey);

const generateTreeRoot = merkleMap.getRoot().toString();

const client = createClient({
  url: process.env.KV_REST_API_URL as string,
  token: process.env.KV_REST_API_TOKEN as string,
});

for (let i = 0; i < nftArray.nftArray.length; i++) {
  const nftId = String(nftArray.nftArray[i].id);
  await client.set(`nft: ${nftId}`, {
    ...nftArray.nftArray[i],
  });
}

const map: MerkleMap = new MerkleMap();

export type nftMetadataIn = {
  name: string;
  description: string;
  id: string;
  cid: string;
  owner: string;
};

for (let i = 0; i < nftArray.nftArray.length; i++) {
  const nftId = String(nftArray.nftArray[i].id);
  const data: nftMetadataIn | null = await client.get(`nft: ${nftId}`);

  if (data) {
    const nftObject: NftReduced = {
      name: Field(data.name),
      description: Field(data.description),
      cid: Field(data.cid),
      id: Field(data.id),
      owner: PublicKey.fromBase58(data.owner),
    };

    map.set(Field(data.id), NFTtoHash(nftObject));
  }
}
const storedTree = map.getRoot().toString();
console.log(storedTree);

console.log('matches subbed tree', storedTree === generateTreeRoot);

//await initRootWithApp(deployerKey, zkAppAddress, merkleMap);
