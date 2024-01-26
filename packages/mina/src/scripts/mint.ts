import { mintNftFromMap } from '../components/transactions.js';
import { generateDummyCollectionWithMap } from '../components/NFT.js';
import {
  getEnvAccount,
  startBerkeleyClient,
  getAppPublic,
} from '../components/transactions.js';
import { MerkleMapContract } from '../NFTsMapContract.js';

startBerkeleyClient();

const { pk: deployerKey } = getEnvAccount();
const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();

const zkApp: MerkleMapContract = new MerkleMapContract(zkAppAddress);

const { map: map, nftArray: nfts } = generateDummyCollectionWithMap(pubKey);

// change to init App root

await mintNftFromMap(deployerKey, nfts.nftArray[0], zkApp, map);
