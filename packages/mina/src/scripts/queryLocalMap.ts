import { PublicKey, Field } from 'o1js';

import { startBerkeleyClient } from '../components/utilities/client.js';
import { getVercelClient, getAppEnv } from '../components/utilities/env.js';
import { generateIntegersArray } from '../components/utilities/helpers.js';
import { getTotalInitedLive } from '../components/AppState.js';
import {
  getMapFromVercelNFTs,
  getVercelMetadata,
  getVercelCommentsPostLength,
  getVercelPostComments,
  getVercelNFT,
  setVercelNFT,
  setVercelMetadata,
} from '../components/NFT/vercel.js';
import { NFTMetadata, createNFT } from '../components/NFT/NFT.js';

startBerkeleyClient();
const client = getVercelClient();

const { appId: appId, zkApp: zkApp } = getAppEnv();

const totalInited = await getTotalInitedLive(zkApp);
const array = generateIntegersArray(totalInited);

const storedMap = await getMapFromVercelNFTs(appId, array, client);

console.log(storedMap.getRoot().toString());
console.log(await getVercelNFT(appId, 7, client));
console.log(await getVercelMetadata(appId, 7, client));

/* console.log(await getVercelCommentsPostLength(appId, 2, client));
console.log(await getVercelPostComments(appId, 2, client)); */

/* const nftMetadata: NFTMetadata = {
  name: 'New Post',
  description: 'Recording in OBS',
  id: Field(7),
  cid: 'https://rgsd4trlmruj8314.public.blob.vercel-storage.com/Ellipse%202PinSaveCircle-xLGwxkGS31RAfPxVN6v4LadPwGd31B.png',
  owner: PublicKey.fromBase58(
    'B62qjV6mDV4dJSp2Gu6QdnqEFv9FmRnMpVraC9qjRbBL5mQBLdowmYv'
  ),
  isMinted: '0',
};
const nftHashed = createNFT(nftMetadata);

await setVercelNFT(appId, nftHashed, client);
await setVercelMetadata(appId, nftMetadata, client);

console.log(await client.keys(`${appId}*`));
 */
