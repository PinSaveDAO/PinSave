import { fetchAccount, fetchLastBlock } from 'o1js';
import { startBerkeleyClient } from '../components/transactions.js';

startBerkeleyClient('https://berkeley.api.minaexplorer.com/');

console.log(
  await fetchAccount({
    publicKey: 'B62qqpPjKKgp8G2kuB82g9NEgfg85vmEAZ84to3FfyQeL4MuFm5Ybc9',
  })
);

console.log(await fetchLastBlock());
