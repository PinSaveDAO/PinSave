import { PublicKey } from 'o1js';

import { mintNFTfromMap } from '../components/transactions.js';
import { generateCollectionWithMap } from '../components/NFT.js';
import {
  getEnvAddresses,
  startBerkeleyClient,
} from '../components/transactions.js';
import { MerkleMapContract } from '../NFTsMapContract.js';

await startBerkeleyClient();

const { pubKey: pubKey, deployerKey: deployerKey } = getEnvAddresses();

const zkAppAddress: PublicKey = PublicKey.fromBase58(
  'B62qkWDJWuPz1aLzwcNNCiEZNFnveQa2DEstF7vtiVJBTbkzi7nhGLm'
);

const zkApp: MerkleMapContract = new MerkleMapContract(zkAppAddress);

const { map: map, nftArray: nfts } = generateCollectionWithMap(pubKey);

// change to init App root

await mintNFTfromMap(deployerKey, nfts.nftArray[0], zkApp, map);
