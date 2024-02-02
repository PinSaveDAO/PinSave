import {
  deployApp,
  getEnvAccount,
  startBerkeleyClient,
} from '../components/transactions.js';

startBerkeleyClient();

const { pk: deployerKey } = getEnvAccount();

const { zkAppPk: pk } = await deployApp(deployerKey);

console.log(pk.toBase58());

console.log(pk.toPublicKey().toBase58());
