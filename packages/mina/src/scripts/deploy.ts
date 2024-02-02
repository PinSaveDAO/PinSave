import {
  deployApp,
  getEnvAccount,
  startBerkeleyClient,
} from '../components/transactions.js';

startBerkeleyClient();

const { pubKey: pubKey, pk: deployerKey } = getEnvAccount();

const { merkleMap: map, zkAppInstance: zkAppInstance } = await deployApp(
  deployerKey,
  true
);
