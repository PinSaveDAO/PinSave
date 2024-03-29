import { PrivateKey } from 'o1js';

import { startBerkeleyClient } from '../components/utilities/client.js';
import { getEnvAccount } from '../components/utilities/env.js';
import { deployApp } from '../components/transactions.js';

startBerkeleyClient();

const proofsEnabled = true;
const live = true;

const { adminPK: adminPK, pubKey: pubKey } = getEnvAccount();

const zkAppPrivateKey: PrivateKey = PrivateKey.random();

console.log('deployer:', pubKey.toBase58());

await deployApp(adminPK, zkAppPrivateKey, proofsEnabled, live);

console.log('app private key:', zkAppPrivateKey.toBase58());
console.log('app public key:', zkAppPrivateKey.toPublicKey().toBase58());
