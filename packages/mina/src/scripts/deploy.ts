import { deployApp } from '../components/transactions.js';

import { Mina, PrivateKey } from 'o1js';
import dotenv from 'dotenv';

dotenv.config();

const proofsEnabled: boolean = true;

const Berkeley = Mina.Network(
  'https://proxy.berkeley.minaexplorer.com/graphql'
);

Mina.setActiveInstance(Berkeley);

const deployerKey: PrivateKey = PrivateKey.fromBase58(
  process.env.deployerKey as string
);

console.log(deployerKey.toPublicKey().toBase58());

const { merkleMap: map, zkAppInstance: zkAppInstance } = await deployApp(
  deployerKey,
  proofsEnabled,
  true
);
