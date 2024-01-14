import {
  deployApp,
  getEnvAddresses,
  startBerkeleyClient,
} from '../components/transactions.js';

await startBerkeleyClient();

const { pubKey: pubKey, deployerKey: deployerKey } = getEnvAddresses();

const { merkleMap: map, zkAppInstance: zkAppInstance } = await deployApp(
  deployerKey,
  true
);
