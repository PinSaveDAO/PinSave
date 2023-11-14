import { MerkleMapContract } from './MerkleMapContract.js';
import { Field, Mina, PrivateKey, MerkleMap, fetchAccount } from 'o1js';
import dotenv from 'dotenv';

dotenv.config();

const proofsEnabled = false;

const Berkeley = Mina.Network(
  'https://proxy.berkeley.minaexplorer.com/graphql'
);

Mina.setActiveInstance(Berkeley);

let verificationKey: any;

if (proofsEnabled) {
  ({ verificationKey } = await MerkleMapContract.compile());
}

// Create a public/private key pair. The public key is your address and where you deploy the zkApp to
const zkAppPrivateKey = PrivateKey.fromBase58(
  process.env.zkAppPrivateKey as string
);
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const deployerKey = PrivateKey.fromBase58(process.env.deployerKey as string);

const deployerAccount = deployerKey.toPublicKey();

// create an instance of MerkleMapContract - and deploy it to zkAppAddress
const zkAppInstance = new MerkleMapContract(zkAppAddress);

console.log(await fetchAccount({ publicKey: zkAppAddress }));

const transactionFee = 800_000_000;

const map = new MerkleMap();

const key = Field(100);
const value = Field(50);

map.set(key, value);

console.log('value for key', key.toString() + ':', map.get(key).toString());

const rootBefore = map.getRoot();

console.log(rootBefore.toString());

/* const init_txn = await Mina.transaction(
  { sender: deployerAccount, fee: transactionFee },
  () => {
    zkAppInstance.initRoot(rootBefore);
  }
);

await init_txn.prove();

await init_txn.sign([deployerKey]).send();
 */

// get the initial state of SmartContract after deployment
const mapRoot = zkAppInstance.mapRoot.get();

console.log('state after deploy rootMap:', mapRoot.toString());
