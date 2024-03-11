import { startBerkeleyClient } from '../components/utilities/client.js';
import { getEnvAccount } from '../components/utilities/env.js';
import { deployApp } from '../components/transactions.js';

startBerkeleyClient();

const displayLogs = false;
const proofsEnabled = true;
const live = true;

const { adminPK: adminPK, pubKey: pubKey } = getEnvAccount();

console.log('deployer:', pubKey.toBase58());

const { zkAppPk: pk } = await deployApp(
  adminPK,
  proofsEnabled,
  live,
  displayLogs
);

console.log('app private key:', pk.toBase58());
console.log('app public key:', pk.toPublicKey().toBase58());
