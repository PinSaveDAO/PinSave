import { Square } from './Square.js';
import { Field, Mina, PrivateKey, AccountUpdate, MerkleMap } from 'o1js';

const proofsEnabled = false;

const Local = Mina.LocalBlockchain({ proofsEnabled: proofsEnabled });

Mina.setActiveInstance(Local);

const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];

console.log('deployerKey: ' + deployerKey.toBase58());
console.log('deployerAccount: ' + deployerAccount.toBase58());

const { privateKey: senderKey, publicKey: senderAccount } =
  Local.testAccounts[1];

// ----------------------------------------------------

let verificationKey: any;

if (proofsEnabled) {
  ({ verificationKey } = await Square.compile());
}

console.log('compiled');

// Create a public/private key pair. The public key is your address and where you deploy the zkApp to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

// create an instance of Square - and deploy it to zkAppAddress
const zkAppInstance = new Square(zkAppAddress);

const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy({ verificationKey, zkappKey: zkAppPrivateKey });
});

await deployTxn.prove();

await deployTxn.sign([deployerKey]).send();

// get the initial state of Square after deployment
const num0 = zkAppInstance.totalAmountInCirculation.get();
const mapRoot = zkAppInstance.mapRoot.get();

console.log('state after init:', num0.toString());
console.log('state after init rootMap:', mapRoot.toString());
// ----------------------------------------------------

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
await init_txn.sign([deployerKey, zkAppPrivateKey]).send();

console.log('initialized root');

const mapRoot1 = zkAppInstance.mapRoot.get();
const treeRoot1 = zkAppInstance.treeRoot.get();

console.log('state after init rootMap: ', mapRoot1.toString());
console.log('state after init treeRoot: ', treeRoot1.toString());
// update the smart contract
const txn2 = await Mina.transaction(deployerAccount, () => {
  zkAppInstance.update(witness, key, Field(50), Field(5));
});

await txn2.prove();
await txn2.sign([deployerKey, zkAppPrivateKey]).send();

const mapRoot2 = zkAppInstance.mapRoot.get();
const treeRoot2 = zkAppInstance.treeRoot.get();

console.log('state after init tx2: ', mapRoot2.toString());
console.log('state after init tx2: ', treeRoot2.toString());
