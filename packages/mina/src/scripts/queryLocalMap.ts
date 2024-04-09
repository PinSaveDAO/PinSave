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
  getVercelNFTAAAllId,
  setVercelMetadata,
  setVercelNFT,
  getVercelNFTAllKeys,
  getVercelNFTAA,
} from '../components/Vercel/vercel.js';
import { getMapFromVercelNFTs } from '../components/Vercel/VercelMap.js';
import {
  deserializeMetadata,
  deserializeNFT,
} from '../components/NFT/deserialization.js';
import { NFT, NFTMetadata, createNFT } from '../components/NFT/NFT.js';
import {
  getVercelMetadataPendingAllId,
  getVercelMetadataPending,
  getVercelNFTPending,
  getVercelNFTPendingAllId,
} from '../components/Vercel/VercelPending.js';

startBerkeleyClient();
const client: VercelKV = getVercelClient();
const { appId: appId, zkApp: zkApp } = getAppEnv();

const totalInited: number = await getTotalInitedLive(zkApp, true);
const array: number[] = generateIntegersArray(totalInited);

const keysNftAA = await getVercelNFTAAAllId(appId, totalInited - 1, client);
const keysPending = await getVercelMetadataPendingAllId(
  appId,
  totalInited - 1,
  client
);

console.log(keysNftAA);
console.log(keysPending);

const nftSynced: string[] = await getVercelNFTAllKeys(appId, client);

/* if (totalInited > nftSynced.length) {
  if (totalInited !== nftSynced.length + 1) {
    throw new Error('unexpected');
  }
  const nftId: number = nftSynced.length;
  const metadataKeys: string[] = await getVercelMetadataPendingAllId(
    appId,
    nftId,
    client
  );
  const nftKeys: string[] = await getVercelNFTPendingAllId(
    appId,
    nftId,
    client
  );

  if (metadataKeys.length !== nftKeys.length) {
    throw new Error('db length not matches');
  }

  const events = await fetchEvents({ publicKey: appId });
  const lastEventEvents = events.at(-1)?.events;

  let nftInited;
  if (lastEventEvents) {
    for (let res of lastEventEvents) {
      if (res.data[0] === '1') {
        nftInited = res.data[1];
      }
    }
  }

  let subbedAttemptId;
  let subbedNFT;
  for (let key of metadataKeys) {
    const attemptId = key.split(' ')[4];
    let nftPending = await getVercelNFTPending(appId, nftId, attemptId, client);
    let nft: NFT = new NFT({
      name: Field(nftPending.name),
      description: Field(nftPending.description),
      id: Field(nftPending.id),
      cid: Field(nftPending.cid),
      owner: PublicKey.fromBase58(nftPending.owner),
      isMinted: Field(nftPending.isMinted),
    });
    if (nftInited === nft.hash().toString()) {
      subbedAttemptId = attemptId;
      subbedNFT = nft;
    }
  }

  if (subbedAttemptId && subbedNFT) {
    let nftPending = await getVercelMetadataPending(
      appId,
      nftId,
      subbedAttemptId,
      client
    );

    let subbedMetadata = deserializeMetadata(nftPending);
    await setVercelMetadata(appId, subbedMetadata, client);
    await setVercelNFT(appId, subbedNFT, client);
  }
} */

const storedMap: MerkleMap = await getMapFromVercelNFTs(appId, array, client);
const storedMapRoot: string = storedMap.getRoot().toString();
const treeRoot: string = await getTreeRootString(zkApp);
console.log(storedMapRoot === treeRoot, 'db matches on-chain root');
