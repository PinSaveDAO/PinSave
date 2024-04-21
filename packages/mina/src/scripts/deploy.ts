import { PrivateKey } from 'o1js';

import { startBerkeleyClient } from '../components/utilities/client.js';
import { getEnvAccount } from '../components/utilities/env.js';
import { deployNFTContract } from '../components/transactions.js';

startBerkeleyClient();

const proofsEnabled: boolean = true;
const live: boolean = true;

const { adminPK, adminPubKey: pubKey } = getEnvAccount();

const zkAppPrivateKey: PrivateKey = PrivateKey.random();

console.log('deployer:', pubKey.toBase58());

await deployNFTContract(adminPK, zkAppPrivateKey, proofsEnabled, live);

console.log('app private key:', zkAppPrivateKey.toBase58());
console.log('app public key:', zkAppPrivateKey.toPublicKey().toBase58());
