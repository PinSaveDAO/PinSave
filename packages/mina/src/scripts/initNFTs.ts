import { Field, MerkleMap, PublicKey } from 'o1js';

import { initRootWithApp } from '../components/transactions.js';
import { storeNFT } from '../components/NFT.js';
import { serializeMerkleMapToJson } from '../components/serialize.js';
import {
  getEnvAddresses,
  startBerkeleyClient,
} from '../components/transactions.js';

await startBerkeleyClient();

const { pubKey: pubKey, deployerKey: deployerKey } = getEnvAddresses();

const zkAppAddress: PublicKey = PublicKey.fromBase58(
  'B62qkWDJWuPz1aLzwcNNCiEZNFnveQa2DEstF7vtiVJBTbkzi7nhGLm'
);

const nftName = 'name';
const nftDescription = 'some random words';
const nftCid = '1244324dwfew1';

const merkleMap: MerkleMap = new MerkleMap();

const NFT10 = storeNFT(
  nftName,
  nftDescription,
  Field(10),
  nftCid,
  pubKey,
  merkleMap
);

const NFT11 = storeNFT(
  nftName,
  nftDescription,
  Field(11),
  nftCid,
  pubKey,
  merkleMap
);

const NFT12 = storeNFT(
  nftName,
  nftDescription,
  Field(12),
  nftCid,
  pubKey,
  merkleMap
);

await initRootWithApp(deployerKey, zkAppAddress, merkleMap);

const mapJson = serializeMerkleMapToJson(merkleMap);

console.log(mapJson);
