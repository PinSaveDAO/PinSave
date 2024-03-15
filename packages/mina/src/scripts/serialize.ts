import { MerkleMap, MerkleTree } from 'o1js';

import { getAppPublic } from '../components/utilities/AppEnv.js';
import { startBerkeleyClient } from '../components/utilities/client.js';
import { generateDummyCollectionMap } from '../components/NFT/dummy.js';
import {
  deserializeJsonToMerkleMap,
  serializeMerkleMapToJson,
} from '../components/serialize.js';

startBerkeleyClient();

const pubKey = getAppPublic();

const merkleMap: MerkleMap = new MerkleMap();
console.log('MerkleMap()', merkleMap.getRoot().toString());

const merkleTree: MerkleTree = new MerkleTree(3);
console.log('MerkleTree', merkleTree.getRoot().toString());

console.log('merkle tree height', merkleTree.height);

console.log('merkle tree leaf count', merkleTree.leafCount);

console.log('merkle tree get node', merkleTree.getNode(0, 0n).toBigInt());

generateDummyCollectionMap(pubKey, merkleMap);

console.log('merkleMap root', merkleMap.getRoot().toString());

const serializedJson: string = serializeMerkleMapToJson(merkleMap);

const map: MerkleMap = deserializeJsonToMerkleMap(serializedJson);

console.log('after serialize-deserialize', map.getRoot().toString());

console.log('merkleMap root', merkleTree.getRoot().toString());
