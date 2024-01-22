import { PublicKey } from 'o1js';

import { initRootWithApp } from '../components/transactions.js';
import { generateCollectionWithMap } from '../components/NFT.js';
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

const { map: merkleMap } = generateCollectionWithMap(pubKey);

await initRootWithApp(deployerKey, zkAppAddress, merkleMap);

const mapJson = serializeMerkleMapToJson(merkleMap);

console.log(mapJson);
