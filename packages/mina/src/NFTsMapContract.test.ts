import { createNFT } from './components/NFT.js';
import {
  deployApp,
  initAppRoot,
  initNFT,
  mintNFT,
  transferNFT,
} from './components/transactions.js';

import { Field, Mina } from 'o1js';

const proofsEnabled: boolean = false;
const enforceTransactionLimits: boolean = true;

const Local = Mina.LocalBlockchain({
  proofsEnabled: proofsEnabled,
  enforceTransactionLimits: enforceTransactionLimits,
});

Mina.setActiveInstance(Local);

const { privateKey: pk1, publicKey: pubKey1 } = Local.testAccounts[0];
const { privateKey: pk2, publicKey: pubKey2 } = Local.testAccounts[1];
const { privateKey: pk3, publicKey: pubKey3 } = Local.testAccounts[2];

const { merkleMap: map, zkAppInstance: zkAppInstance } = await deployApp(
  pk1,
  proofsEnabled
);

console.log('deployed app');

await initAppRoot(pubKey1, pk1, zkAppInstance, map);

console.log('initialized root');

const nftName = 'name';
const nftDescription = 'some random words';
const nftCid = '1244324dwfew1';

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

await mintNFT(pubKey1, pk1, newNFT, zkAppInstance, map);

console.log('mints sucessfully');

await mintNFT(pubKey2, pk2, NFT2, zkAppInstance, map);

console.log('mints sucessfully');

await transferNFT(pubKey1, pk1, pubKey2, pk2, newNFT, zkAppInstance, map);

console.log('transfered ownership sucessfully');

await transferNFT(pubKey2, pk2, pubKey3, pk3, NFT2, zkAppInstance, map);

console.log('transfered ownership sucessfully');
