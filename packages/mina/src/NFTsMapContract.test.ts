import { Field } from 'o1js';

import { createNFT, generateCollection } from './components/NFT.js';
import {
  deployApp,
  initAppRoot,
  initNFT,
  mintNFTfromMap,
  startLocalBlockchainClient,
  transferNFT,
} from './components/transactions.js';

const proofsEnabled: boolean = false;
const enforceTransactionLimits: boolean = true;

const testAccounts = await startLocalBlockchainClient(
  proofsEnabled,
  enforceTransactionLimits
);

const { privateKey: pk1, publicKey: pubKey1 } = testAccounts[0];
const { privateKey: pk2, publicKey: pubKey2 } = testAccounts[1];
const { privateKey: pk3, publicKey: pubKey3 } = testAccounts[2];

const { merkleMap: map, zkAppInstance: zkAppInstance } = await deployApp(
  pk1,
  proofsEnabled
);

console.log('deployed app');

// add some initial values into the map

const nftArray = generateCollection(pubKey1, map);

await initAppRoot(pk1, zkAppInstance, map);

console.log('initialized root');

await mintNFTfromMap(pk1, nftArray[0], zkAppInstance, map);

console.log('minted NFT');

// init nft on the contract
const nftName: string = 'name';
const nftDescription: string = 'some random words';
const nftCid: string = '1244324dwfew1';

const newNFT = createNFT(nftName, nftDescription, Field(1), nftCid, pubKey1);

await initNFT(pubKey1, pk1, newNFT, zkAppInstance, map);

console.log('inited NFT');

try {
  await initNFT(pubKey1, pk1, newNFT, zkAppInstance, map);
} catch {
  console.log('failed sucessfully to initialize NFT which already exists');
}

const NFT2 = createNFT(nftName, nftDescription, Field(2), nftCid, pubKey2);

await initNFT(pubKey2, pk2, NFT2, zkAppInstance, map);

console.log('inited NFT - 2 sucessfully');

await mintNFTfromMap(pk1, newNFT, zkAppInstance, map);

console.log('mints sucessfully');

await mintNFTfromMap(pk2, NFT2, zkAppInstance, map);

console.log('mints sucessfully');

await transferNFT(pubKey1, pk1, pubKey2, pk2, newNFT, zkAppInstance, map);

console.log('transfered ownership sucessfully');

await transferNFT(pubKey2, pk2, pubKey3, pk3, NFT2, zkAppInstance, map);

console.log('transfered ownership sucessfully');
