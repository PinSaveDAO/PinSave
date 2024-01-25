import { initRootWithApp } from '../components/transactions.js';
import { generateCollectionWithMap } from '../components/NFT.js';
import { serializeMerkleMapToJson } from '../components/serialize.js';
import {
  getEnvAccount,
  startBerkeleyClient,
  getAppPublic,
} from '../components/transactions.js';

startBerkeleyClient();

const { pk: deployerKey } = getEnvAccount();
const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();

const { map: merkleMap } = generateCollectionWithMap(pubKey);

await initRootWithApp(deployerKey, zkAppAddress, merkleMap);

const mapJson = serializeMerkleMapToJson(merkleMap);

console.log(mapJson);
