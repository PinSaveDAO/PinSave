import { Square } from './Square.js';
import { Field, Mina, PrivateKey, AccountUpdate } from 'o1js';

console.log('o1js loaded');

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
console.log('state after init:', num0.toString());

// ----------------------------------------------------

const init_txn = await Mina.transaction(deployerAccount, () => {
  zkAppInstance.update();
});

await init_txn.prove();
await init_txn.sign([deployerKey, zkAppPrivateKey]).send();

console.log('initialized');

const num1 = zkAppInstance.totalAmountInCirculation.get();
console.log('state after txn1:', num1.toString());
