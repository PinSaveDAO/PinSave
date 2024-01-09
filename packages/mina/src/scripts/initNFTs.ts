import { initNFT } from '../components/transactions.js';
import { storeNFT } from '../components/NFT.js';

import { Mina, PrivateKey, Field, MerkleMap } from 'o1js';
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
console.log(merkleMap.getRoot().toString());

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

//await initAppRoot(pubKey1, pk1, zkAppInstance, map);

console.log(merkleMap.getRoot().toString());
