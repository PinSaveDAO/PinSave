import { MerkleMapContract } from './MerkleMapContract.js';
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
  const mapRoot = zkAppInstance.mapRoot.get();
  const treeRoot = zkAppInstance.treeRoot.get();

  console.log('mapRoot state : ', mapRoot.toString());
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

const map = new MerkleMap();

const key = Field(100);
const value = Field(50);

map.set(key, value);

console.log('value for key', key.toString() + ':', map.get(key).toString());

const rootBefore = map.getRoot();

console.log(rootBefore.toString());

const witness = map.getWitness(key);

const init_txn = await Mina.transaction(deployerAccount, () => {
  zkAppInstance.initRoot(rootBefore);
});

await init_txn.prove();
await init_txn.sign([deployerKey]).send();

console.log('initialized root');

logStates();

const txn2 = await Mina.transaction(deployerAccount, () => {
  zkAppInstance.update(witness, key, value, Field(5));
});

await txn2.prove();
await txn2.sign([deployerKey]).send();

logStates();

const txn3 = await Mina.transaction(deployerAccount2, () => {
  zkAppInstance.update(witness, key, value, Field(5));
});

await txn3.prove();
await txn3.sign([deployerKey2]).send();

logStates();

const key2 = Field(10);
const value2 = Field(0);

const witness2 = map.getWitness(key2);

console.log('value for key', key2.toString() + ':', map.get(key2).toString());

const txn4 = await Mina.transaction(deployerAccount, () => {
  zkAppInstance.update(witness2, key2, value2, Field(5));
});

await txn4.prove();
await txn4.sign([deployerKey]).send();

logStates();

const key3 = Poseidon.hash(CircuitString.fromString('qwert').toFields());
const value3 = Field(0);

const witness3 = map.getWitness(key3);

console.log('value for key', key3.toString() + ':', map.get(key3).toString());

await Mina.transaction(deployerAccount, () => {
  zkAppInstance.update(witness3, key3, value3, Field(5));
});

logStates();

try {
  const fail_txn = await Mina.transaction(deployerAccount, () => {
    zkAppInstance.initRoot(rootBefore);
  });

  await fail_txn.prove();
  await fail_txn.sign([deployerKey]).send();
} catch {
  console.log('failed sucessfully');
}
