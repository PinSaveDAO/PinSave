import { MerkleMap, MerkleTree } from 'o1js';

import {
  deserializeJsonToMerkleMap,
  serializeMerkleMapToJson,
  serializeMerkleTreeToJson,
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

const merkleTree: MerkleTree = new MerkleTree(10);
console.log('MerkleTree(10)', merkleTree.getRoot().toString());

console.log('merkle tree height', merkleTree.height);

console.log('merkle tree leaf count', merkleTree.leafCount);

console.log('merkle tree get node', merkleTree.getNode(0, 0n).toBigInt());

generateNftCollection(pubKey, merkleMap);

console.log('merkleMap root', merkleMap.getRoot().toString());

const serializedJson: string = serializeMerkleMapToJson(merkleMap);

const map: MerkleMap = deserializeJsonToMerkleMap(serializedJson);

console.log('after serialize-deserialize', map.getRoot().toString());

const exampleMerkleTree = serializeMerkleTreeToJson(merkleTree);

console.log(exampleMerkleTree);
