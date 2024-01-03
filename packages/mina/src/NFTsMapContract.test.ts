import { MerkleMapContract } from './NFTsMapContract.js';
import { createNFT, NFTtoHash } from './components/NFT.js';
import { logStates } from './components/AppState.js';
import { logTokenBalances } from './components/TokenBalances.js';

import { Field, Mina, PrivateKey, AccountUpdate, MerkleMap } from 'o1js';

const proofsEnabled = false;
const enforceTransactionLimits = true;

const Local = Mina.LocalBlockchain({
  proofsEnabled: proofsEnabled,
  enforceTransactionLimits: enforceTransactionLimits,
});

Mina.setActiveInstance(Local);

const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: deployerKey2, publicKey: deployerAccount2 } =
  Local.testAccounts[1];
const { privateKey: deployerKey3, publicKey: deployerAccount3 } =
  Local.testAccounts[2];

let verificationKey: any;

if (proofsEnabled) {
  ({ verificationKey } = await MerkleMapContract.compile());
  console.log('compiled');
}

const map = new MerkleMap();
const rootBefore = map.getRoot();

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const zkAppInstance = new MerkleMapContract(zkAppAddress);

const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy({ verificationKey, zkappKey: zkAppPrivateKey });
});

await deployTxn.prove();
await deployTxn.sign([deployerKey]).send();

logStates(zkAppInstance, map);

console.log('deployed app');

const init_txn = await Mina.transaction(deployerAccount, () => {
  zkAppInstance.initRoot(rootBefore);
});

await init_txn.prove();
await init_txn.sign([deployerKey]).send();

logStates(zkAppInstance, map);

console.log('initialized root');

const key = Field(1);
const witness = map.getWitness(key);

const nftName = 'name';
const nftDescription = 'some random words';
const nftCid = '1244324dwfew1';

const newNFT = createNFT(nftName, nftDescription, key, nftCid, deployerAccount);

map.set(key, NFTtoHash(newNFT));

const init_mint_txn = await Mina.transaction(deployerAccount, () => {
  zkAppInstance.initNFT(newNFT, witness);
});

await init_mint_txn.prove();
await init_mint_txn.sign([deployerKey]).send();

logStates(zkAppInstance, map);

console.log('inited NFT');

try {
  const fail_init_mint_txn = await Mina.transaction(deployerAccount, () => {
    zkAppInstance.initNFT(newNFT, witness);
  });

  await fail_init_mint_txn.prove();
  await fail_init_mint_txn.sign([deployerKey]).send();
} catch {
  console.log('failed sucessfully');
}

const key2 = Field(2);

const witness2 = map.getWitness(key2);

const NFT2 = createNFT(nftName, nftDescription, key2, nftCid, deployerAccount2);

map.set(key2, NFTtoHash(NFT2));

const init_mint_txn2 = await Mina.transaction(deployerAccount2, () => {
  zkAppInstance.initNFT(NFT2, witness2);
});

await init_mint_txn2.prove();
await init_mint_txn2.sign([deployerKey2]).send();

logStates(zkAppInstance, map);

console.log('inited NFT - 2 sucessfully');

const witnessnewNFT = map.getWitness(Field(1));

const mint_txn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.mintNFT(newNFT, witnessnewNFT);
});

await mint_txn.prove();
await mint_txn.sign([deployerKey]).send();

logTokenBalances(Mina, deployerAccount, zkAppInstance);
console.log('mints sucessfully');

const mint_txn2 = await Mina.transaction(deployerAccount2, () => {
  AccountUpdate.fundNewAccount(deployerAccount2);
  zkAppInstance.mintNFT(NFT2, witness2);
});

await mint_txn2.prove();
await mint_txn2.sign([deployerKey2]).send();

logStates(zkAppInstance, map);
logTokenBalances(Mina, deployerAccount2, zkAppInstance);

console.log('mints sucessfully');

const nft_transfer_txn = await Mina.transaction(deployerAccount, () => {
  zkAppInstance.transferOwner(newNFT, deployerAccount2, witnessnewNFT);
});

await nft_transfer_txn.prove();
await nft_transfer_txn.sign([deployerKey, deployerKey2]).send();

newNFT.changeOwner(deployerAccount2);

map.set(Field(1), NFTtoHash(newNFT));

logTokenBalances(Mina, deployerAccount, zkAppInstance);
logTokenBalances(Mina, deployerAccount2, zkAppInstance);

logStates(zkAppInstance, map);

console.log('transfer ownership sucessfully');

const nft_transfer_txn2 = await Mina.transaction(deployerAccount2, () => {
  AccountUpdate.fundNewAccount(deployerAccount3);
  zkAppInstance.transferOwner(NFT2, deployerAccount3, map.getWitness(Field(2)));
});

await nft_transfer_txn2.prove();
await nft_transfer_txn2.sign([deployerKey2, deployerKey3]).send();

NFT2.changeOwner(deployerAccount3);

map.set(Field(2), NFTtoHash(NFT2));

logTokenBalances(Mina, deployerAccount, zkAppInstance);
logTokenBalances(Mina, deployerAccount2, zkAppInstance);
logTokenBalances(Mina, deployerAccount3, zkAppInstance);

logStates(zkAppInstance, map);

console.log('transfer ownership sucessfully');
