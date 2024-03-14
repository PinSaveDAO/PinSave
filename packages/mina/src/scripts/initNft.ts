import { PrivateKey } from 'o1js';

import { startBerkeleyClient } from '../components/utilities/client.js';
import {
  getEnvAccount,
  getVercelClient,
  getAppEnv,
} from '../components/utilities/env.js';
import { generateIntegersArrayIncluding } from '../components/utilities/helpers.js';
import { getTotalInitedLive } from '../components/AppState.js';
import { generateDummyNFT } from '../components/NFT/dummy.js';
import {
  setVercelNFT,
  setVercelMetadata,
  getMapFromVercelNFTs,
} from '../components/NFT/vercel.js';
import { initNFT } from '../components/transactions.js';

startBerkeleyClient();
const client = getVercelClient();

const { appId: appId, zkApp: zkApp } = getAppEnv();
const { pubKey: adminPub, adminPK: adminPk } = getEnvAccount();

const userPK: PrivateKey = PrivateKey.fromBase58(process.env.userpk as string);

const userPub = userPK.toPublicKey();

const totalInited = await getTotalInitedLive(zkApp);
const array = generateIntegersArrayIncluding(totalInited);
const storedMap = await getMapFromVercelNFTs(appId, array, client);

const { nftHashed: nftHashed, nftMetadata: nftMetadata } = generateDummyNFT(
  totalInited,
  userPub
);

const compile = true;

await initNFT(adminPk, userPK, nftHashed, zkApp, storedMap, compile);
await setVercelNFT(appId, nftHashed, client);
await setVercelMetadata(appId, nftMetadata, client);
