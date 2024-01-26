import { initNft } from '../components/transactions.js';
import {
  generateDummyCollectionWithMap,
  generateDummyNft,
} from '../components/NFT.js';
import { serializeMerkleMapToJson } from '../components/serialize.js';
import {
  getEnvAccount,
  startBerkeleyClient,
  getAppPublic,
} from '../components/transactions.js';
import { MerkleMapContract, NFT } from '../NFTsMapContract.js';

startBerkeleyClient();

const { pk: pk } = getEnvAccount();
const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();

// instead obtain collection from db
const { map: merkleMap } = generateDummyCollectionWithMap(pubKey);

const nft = generateDummyNft(1234, pubKey);

const zkApp: MerkleMapContract = new MerkleMapContract(zkAppAddress);

await initNft(pubKey, pk, nft, zkApp, merkleMap);

// instead save to db
const mapJson = serializeMerkleMapToJson(merkleMap);

console.log(mapJson);
