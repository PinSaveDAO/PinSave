import { fetchAccount } from 'o1js';
import {
  startBerkeleyClient,
  getAppPublic,
} from '../components/transactions.js';

startBerkeleyClient();

const publicKey = getAppPublic();

console.log(
  await fetchAccount({
    publicKey: publicKey,
  })
);
