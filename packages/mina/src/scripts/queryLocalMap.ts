import type { VercelKV } from '@vercel/kv';
import { MerkleMap, fetchEvents, Field, PublicKey } from 'o1js';

import { startBerkeleyClient } from '../components/utilities/client.js';
import { getVercelClient, getAppEnv } from '../components/utilities/env.js';
import { generateIntegersArray } from '../components/utilities/helpers.js';
import {
  getTotalInitedLive,
  getTreeRootString,
} from '../components/AppState.js';
import {
  getVercelMetadata,
  getVercelNFT,
  getVercelNFTAA,
  getVercelNFTAAAllId,
  getVercelMetadataAA,
  setVercelMetadata,
  NFTSerializedDataAA,
  setVercelNFT,
} from '../components/Vercel/vercel.js';
import { getMapFromVercelNFTs } from '../components/Vercel/VercelMap.js';
import {
  NFTMetadataAA,
  NFTSerializedData,
} from '../components/NFT/deserialization.js';
import { NFT, NFTMetadata } from '../components/NFT/NFT.js';
import { getVercelMetadataPendingAllId } from '../components/Vercel/VercelPending.js';

startBerkeleyClient();
const client: VercelKV = getVercelClient();
const { appId: appId, zkApp: zkApp } = getAppEnv();

const totalInited: number = await getTotalInitedLive(zkApp, true);
const array: number[] = generateIntegersArray(totalInited);

const keysAA = await getVercelNFTAAAllId(appId, totalInited - 1, client);
const keysPending = await getVercelMetadataPendingAllId(
  appId,
  totalInited - 1,
  client
);

console.log(keysPending);
console.log(keysAA);

/* if (keys.length === 1) {
  console.log(keys[0]);
  console.log(keys[0].split(' '));

  const nftId = keys[0].split(' ')[3];
  const attemptId = keys[0].split(' ')[4];

  const nftMetadataAA: NFTSerializedDataAA = await getVercelMetadataAA(
    appId,
    nftId,
    attemptId,
    client
  );
  const nftMetadata: NFTMetadata = {
    name: nftMetadataAA.name,
    description: nftMetadataAA.description,
    id: Field(nftMetadataAA.id),
    cid: nftMetadataAA.cid,
    owner: PublicKey.fromBase58(nftMetadataAA.owner),
    isMinted: nftMetadataAA.isMinted,
  };
  const nftAA: NFTSerializedDataAA = await getVercelNFTAA(
    appId,
    nftId,
    attemptId,
    client
  );
  const nft: NFT = new NFT({
    name: Field(nftAA.name),
    description: Field(nftAA.description),
    id: Field(nftAA.id),
    cid: Field(nftAA.cid),
    owner: PublicKey.fromBase58(nftMetadataAA.owner),
    isMinted: Field(nftMetadataAA.isMinted),
  });
  setVercelMetadata(appId, nftMetadata, client);
  setVercelNFT(appId, nft, client);
} */

const storedMap: MerkleMap = await getMapFromVercelNFTs(appId, array, client);
const storedMapRoot: string = storedMap.getRoot().toString();
const treeRoot: string = await getTreeRootString(zkApp);
console.log(storedMapRoot === treeRoot, 'db matches on-chain root');

/* console.log(await getVercelNFT(appId, 0, client));
console.log(await getVercelMetadata(appId, 0, client)); */

//console.log(await getVercelNFTPendingAllId(appId, 3, client));

//console.log(await client.keys(`*`));

/* const events = await fetchEvents({ publicKey: appId });

console.log(events.length);

for (let event of events) {
  console.log(event.events);
}
 */
