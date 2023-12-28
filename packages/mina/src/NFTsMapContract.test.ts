import { MerkleMapContract, NFT } from './NFTsMapContract.js';
import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  MerkleMap,
  CircuitString,
  Poseidon,
  PublicKey,
} from 'o1js';

function logStates() {
  const treeRoot = zkAppInstance.treeRoot.get();

  console.log('treeRoot state : ', treeRoot.toString());
}

const proofsEnabled = false;

const Local = Mina.LocalBlockchain({ proofsEnabled: proofsEnabled });

Mina.setActiveInstance(Local);

const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: deployerKey2, publicKey: deployerAccount2 } =
  Local.testAccounts[1];

console.log('deployerPrivateKey: ' + deployerKey.toBase58());
console.log('deployerAccount: ' + deployerAccount.toBase58());

// ----------------------------------------------------

let verificationKey: any;

if (proofsEnabled) {
  ({ verificationKey } = await MerkleMapContract.compile());
  //console.log(verificationKey.hash);
}

console.log('compiled');

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const zkAppInstance = new MerkleMapContract(zkAppAddress);

const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy({ verificationKey, zkappKey: zkAppPrivateKey });
});

await deployTxn.prove();
await deployTxn.sign([deployerKey]).send();

logStates();

console.log('deployed app');

const map = new MerkleMap();

const rootBefore = map.getRoot();

const init_txn = await Mina.transaction(deployerAccount, () => {
  zkAppInstance.initRoot(rootBefore);
});

await init_txn.prove();
await init_txn.sign([deployerKey]).send();

logStates();

console.log('initialized root');

const key = Field(1);

const witness = map.getWitness(key);

const songName = 'name';

const newNFT: NFT = {
  name: Poseidon.hash(CircuitString.fromString(songName).toFields()),
  description: Poseidon.hash(CircuitString.fromString(songName).toFields()),
  id: key,
  cid: Poseidon.hash(CircuitString.fromString(songName).toFields()),
  owner: deployerAccount,
  changeOwner: function (newAddress: PublicKey): void {
    throw new Error('Function not implemented.');
  },
};

const value = Poseidon.hash(NFT.toFields(newNFT));

map.set(key, value);

const mint_txn = await Mina.transaction(deployerAccount, () => {
  zkAppInstance.initNFT(newNFT, witness);
});

await mint_txn.prove();
await mint_txn.sign([deployerKey]).send();

logStates();

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

var NFT2: NFT = {
  name: Poseidon.hash(CircuitString.fromString(songName).toFields()),
  description: Poseidon.hash(CircuitString.fromString(songName).toFields()),
  id: key2,
  cid: Poseidon.hash(CircuitString.fromString(songName).toFields()),
  owner: deployerAccount,
  changeOwner: function (newAddress: PublicKey): void {
    throw new Error('Function not implemented.');
  },
};

const value2 = Poseidon.hash(NFT.toFields(NFT2));
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

logStates();

NFT2.owner = deployerAccount2;

const value2New = Poseidon.hash(NFT.toFields(NFT2));
map.set(key2, value2New);

console.log(map.getRoot().toString());

console.log('transfer ownership sucessfully');
