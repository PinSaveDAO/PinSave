import { MerkleMapContract } from '../NFTsMapContract.js';
import { logAppStates } from '../components/AppState.js';

import { Mina, PrivateKey, fetchAccount, PublicKey } from 'o1js';
import dotenv from 'dotenv';

dotenv.config();

const Berkeley = Mina.Network(
  'https://proxy.berkeley.minaexplorer.com/graphql'
);

Mina.setActiveInstance(Berkeley);

const deployerKey = PrivateKey.fromBase58(process.env.deployerKey as string);

console.log(deployerKey.toPublicKey().toBase58());

const zkAppAddress: PublicKey = PublicKey.fromBase58(
  'B62qkWDJWuPz1aLzwcNNCiEZNFnveQa2DEstF7vtiVJBTbkzi7nhGLm'
);

const zkAppInstance = new MerkleMapContract(zkAppAddress);

console.log(zkAppInstance.address.toBase58());

await fetchAccount({ publicKey: zkAppAddress });

logAppStates(zkAppInstance);
