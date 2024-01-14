import { fetchAccount, PublicKey } from 'o1js';

import { MerkleMapContract } from '../NFTsMapContract.js';
import { logAppStates } from '../components/AppState.js';
import { startBerkeleyClient } from '../components/transactions.js';

startBerkeleyClient();

const zkAppAddress: PublicKey = PublicKey.fromBase58(
  'B62qkWDJWuPz1aLzwcNNCiEZNFnveQa2DEstF7vtiVJBTbkzi7nhGLm'
);

const zkAppInstance: MerkleMapContract = new MerkleMapContract(zkAppAddress);

await fetchAccount({ publicKey: zkAppAddress });

logAppStates(zkAppInstance);
