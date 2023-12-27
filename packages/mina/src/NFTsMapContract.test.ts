import { MerkleMapContract, NFT } from './NFTsMapContract.js';
import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  MerkleMap,
  CircuitString,
  Poseidon,
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
};

//console.log(Poseidon.hash(NFT.toFields(newNFT)));

const mint_txn = await Mina.transaction(deployerAccount, () => {
  zkAppInstance.initNFT(newNFT, witness);
});

await mint_txn.prove();
await mint_txn.sign([deployerKey]).send();

logStates();

console.log('inited NFT');
