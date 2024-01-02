import { MerkleMapContract } from './NFTsMapContract.js';
import { createNFT, NFTtoHash } from './components/NFT.js';
import { logStates } from './components/AppState.js';

import { Field, Mina, PrivateKey, AccountUpdate, MerkleMap } from 'o1js';

const proofsEnabled = false;

const Local = Mina.LocalBlockchain({ proofsEnabled: proofsEnabled });

Mina.setActiveInstance(Local);

const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: deployerKey2, publicKey: deployerAccount2 } =
  Local.testAccounts[1];

let verificationKey: any;

if (proofsEnabled) {
  ({ verificationKey } = await MerkleMapContract.compile());
  console.log('compiled');
}

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const zkAppInstance = new MerkleMapContract(zkAppAddress);

const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy({ verificationKey, zkappKey: zkAppPrivateKey });
});

await deployTxn.prove();
await deployTxn.sign([deployerKey]).send();

logStates(zkAppInstance);

console.log('deployed app');

const map = new MerkleMap();

const rootBefore = map.getRoot();

const init_txn = await Mina.transaction(deployerAccount, () => {
  zkAppInstance.initRoot(rootBefore);
});

await init_txn.prove();
await init_txn.sign([deployerKey]).send();

logStates(zkAppInstance);

console.log('initialized root');

const key = Field(1);
const witness = map.getWitness(key);

const nftName = 'name';
const nftDescription = 'some random words';
const nftCid = '1244324dwfew1';

const newNFT = createNFT(nftName, nftDescription, key, nftCid, deployerAccount);
const value = NFTtoHash(newNFT);

map.set(key, value);

const mint_txn = await Mina.transaction(deployerAccount, () => {
  zkAppInstance.initNFT(newNFT, witness);
});

await mint_txn.prove();
await mint_txn.sign([deployerKey]).send();

logStates(zkAppInstance);

console.log('inited NFT');

try {
  const fail_txn = await Mina.transaction(deployerAccount, () => {
    zkAppInstance.initNFT(newNFT, witness);
  });

  await fail_txn.prove();
  await fail_txn.sign([deployerKey]).send();
} catch {
  console.log('failed sucessfully');
}

const key2 = Field(2);

const witness2 = map.getWitness(key2);

var NFT2 = createNFT(nftName, nftDescription, key2, nftCid, deployerAccount);

const value2 = NFTtoHash(NFT2);
map.set(key2, value2);

const mint2_txn = await Mina.transaction(deployerAccount, () => {
  zkAppInstance.initNFT(NFT2, witness2);
});

await mint2_txn.prove();
await mint2_txn.sign([deployerKey]).send();

console.log('inited NFT - 2 sucessfully');

const mint_transfer_txn = await Mina.transaction(deployerAccount, () => {
  zkAppInstance.mintNFT(NFT2, witness2);
});

await mint_transfer_txn.prove();
await mint_transfer_txn.sign([deployerKey]).send();

console.log('mints sucessfully');

const nft_transfer_txn = await Mina.transaction(deployerAccount, () => {
  zkAppInstance.transferOwner(NFT2, deployerAccount2, witness2);
});

await nft_transfer_txn.prove();
await nft_transfer_txn.sign([deployerKey]).send();

logStates(zkAppInstance);

NFT2.owner = deployerAccount2;

const value2New = NFTtoHash(NFT2);

map.set(key2, value2New);

console.log(map.getRoot().toString());

console.log('transfer ownership sucessfully');
