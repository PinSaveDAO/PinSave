import { PublicKey } from 'o1js';

import { logAppStatesContract } from '../components/AppState.js';
import { startBerkeleyClient } from '../components/transactions.js';

startBerkeleyClient();

const zkAppAddress: PublicKey = PublicKey.fromBase58(
  'B62qkWDJWuPz1aLzwcNNCiEZNFnveQa2DEstF7vtiVJBTbkzi7nhGLm'
);

logAppStatesContract(zkAppAddress);
