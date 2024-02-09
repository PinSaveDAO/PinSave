import { fetchAccount } from 'o1js';
import {
  startBerkeleyClient,
  getAppPublic,
} from '../components/transactions.js';

startBerkeleyClient();

const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();

console.log(
  await fetchAccount({
    publicKey: pubKey,
  })
);
