import { MerkleMap, MerkleTree } from 'o1js';

import {
  deserializeJsonToMerkleMap,
  serializeMerkleMapToJson,
} from '../components/serialize.js';
import { generateNftCollection } from '../components/NFT.js';
import {
  startBerkeleyClient,
  getEnvAddresses,
} from '../components/transactions.js';

startBerkeleyClient();

const { pubKey: pubKey, deployerKey: deployerKey } = getEnvAddresses();

const merkleMap: MerkleMap = new MerkleMap();
console.log('MerkleMap()', merkleMap.getRoot().toString());

const merkleTree = new MerkleTree(256);
console.log('MerkleTree(256)', merkleTree.getRoot().toString());

generateNftCollection(pubKey, merkleMap);

console.log(merkleMap.getRoot().toString());

const serializedJson = serializeMerkleMapToJson(merkleMap);

const map = deserializeJsonToMerkleMap(serializedJson);

console.log(map.getRoot().toString());
