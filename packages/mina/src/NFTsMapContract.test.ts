import { MerkleMapContract } from './NFTsMapContract.js';
import { createNFT } from './components/NFT.js';
import { logStates } from './components/AppState.js';
import {
  initAppRoot,
  initNFT,
  mintNFT,
  transferNFT,
} from './components/transactions.js';

import { Field, Mina, PrivateKey, AccountUpdate, MerkleMap } from 'o1js';

const proofsEnabled = false;
const enforceTransactionLimits = true;

const Local = Mina.LocalBlockchain({
  proofsEnabled: proofsEnabled,
  enforceTransactionLimits: enforceTransactionLimits,
});

Mina.setActiveInstance(Local);

const { privateKey: pk, publicKey: pubKey } = Local.testAccounts[0];
const { privateKey: pk2, publicKey: pubKey2 } = Local.testAccounts[1];
const { privateKey: pk3, publicKey: pubKey3 } = Local.testAccounts[2];

let verificationKey: any;

if (proofsEnabled) {
  ({ verificationKey } = await MerkleMapContract.compile());
  console.log('compiled');
}

const map = new MerkleMap();

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const zkAppInstance = new MerkleMapContract(zkAppAddress);

const deployTxn = await Mina.transaction(pubKey, () => {
  AccountUpdate.fundNewAccount(pubKey);
  zkAppInstance.deploy({ verificationKey, zkappKey: zkAppPrivateKey });
});

await deployTxn.prove();
await deployTxn.sign([pk]).send();

logStates(zkAppInstance, map);

console.log('deployed app');

await initAppRoot(pubKey, pk, zkAppInstance, map);

console.log('initialized root');

const nftName = 'name';
const nftDescription = 'some random words';
const nftCid = '1244324dwfew1';

const newNFT = createNFT(nftName, nftDescription, Field(1), nftCid, pubKey);

await initNFT(pubKey, pk, newNFT, zkAppInstance, map);

console.log('inited NFT');

try {
  await initNFT(pubKey, pk, newNFT, zkAppInstance, map);
} catch {
  console.log('failed sucessfully to initialize NFT which already exists');
}

const NFT2 = createNFT(nftName, nftDescription, Field(2), nftCid, pubKey2);

await initNFT(pubKey2, pk2, NFT2, zkAppInstance, map);

console.log('inited NFT - 2 sucessfully');

await mintNFT(pubKey, pk, newNFT, zkAppInstance, map);

console.log('mints sucessfully');

await mintNFT(pubKey2, pk2, NFT2, zkAppInstance, map);

console.log('mints sucessfully');

await transferNFT(pubKey, pk, pubKey2, pk2, newNFT, zkAppInstance, map);

console.log('transfered ownership sucessfully');

await transferNFT(pubKey2, pk2, pubKey3, pk3, NFT2, zkAppInstance, map);

console.log('transfered ownership sucessfully');
