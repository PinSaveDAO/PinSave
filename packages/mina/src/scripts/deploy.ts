import {
  startBerkeleyClient,
} from '../components/client.js';
import { deployApp } from '../components/transactions.js';
import { getEnvAccount } from '../components/env.js';

startBerkeleyClient();

const displayLogs = false;
const proofsEnabled = true;
const live = true;

const { pk: deployerKey, pubKey: pubKey } = getEnvAccount();

console.log('deployer:', pubKey.toBase58());

const { zkAppPk: pk } = await deployApp(
  deployerKey,
  proofsEnabled,
  live,
  displayLogs
);

console.log('app private key:', pk.toBase58());
console.log('app public key:', pk.toPublicKey().toBase58());
