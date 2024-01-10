import { storeNFT } from '../components/NFT.js';
import {
  deserializeJsonToMerkleMap,
  serializeMerkleMapToJson,
} from '../components/serialize.js';

import { Mina, PrivateKey, Field, MerkleMap, MerkleTree } from 'o1js';
import dotenv from 'dotenv';

dotenv.config();

const proofsEnabled: boolean = true;

const Berkeley = Mina.Network(
  'https://proxy.berkeley.minaexplorer.com/graphql'
);

Mina.setActiveInstance(Berkeley);

const deployerKey: PrivateKey = PrivateKey.fromBase58(
  process.env.deployerKey as string
);

const pubKey = deployerKey.toPublicKey();

const nftName = 'name';
const nftDescription = 'some random words';
const nftCid = '1244324dwfew1';

const merkleMap: MerkleMap = new MerkleMap();
console.log('MerkleMap()', merkleMap.getRoot().toString());

const merkleTree = new MerkleTree(256);
console.log('MerkleTree(256)', merkleTree.getRoot().toString());

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

console.log(merkleMap.getRoot().toString());

const serializedJson = serializeMerkleMapToJson(merkleMap);

const map = deserializeJsonToMerkleMap(serializedJson);

console.log(map.getRoot().toString());
