import type { VercelKV } from '@vercel/kv';
import { fetchEvents } from 'o1js';

import { getAppString, getAppContract } from '../utilities/AppEnv.js';
import { getTotalInitedLive } from '../AppState.js';
import { deserializeMetadata, deserializeNFT } from '../NFT/deserialization.js';
import { NFT } from '../NFT/NFT.js';
import {
  setVercelMetadata,
  setVercelNFT,
  getVercelNFTAllKeys,
} from '../Vercel/vercel.js';
import {
  getVercelMetadataPendingIdAllKeys,
  getVercelMetadataPending,
  getVercelNFTPending,
  getVercelNFTPendingIdAllKeys,
} from '../Vercel/VercelPending.js';
import {
  getVercelMetadataAA,
  getVercelMetadataAAAllKeys,
  getVercelNFTAA,
  getVercelNFTAAAllKeys,
  NFTSerializedDataAA,
} from './VercelAA.js';
import { NFTContract } from '../../NFTsMapContract.js';

export async function validateTreeInited(client: VercelKV): Promise<boolean> {
  const appId: string = getAppString();
  const zkAppInstance: NFTContract = getAppContract();

  const totalInited: number = await getTotalInitedLive(zkAppInstance, true);
  const nftSynced: string[] = await getVercelNFTAllKeys(appId, client);

  if (totalInited > nftSynced.length) {
    if (totalInited !== nftSynced.length + 1) {
      throw new Error('unexpected');
    }

    const nftId: number = nftSynced.length;
    const metadataPendingKeys: string[] =
      await getVercelMetadataPendingIdAllKeys(appId, nftId, client);
    const nftPendingKeys: string[] = await getVercelNFTPendingIdAllKeys(
      appId,
      nftId,
      client
    );

    if (metadataPendingKeys.length !== nftPendingKeys.length) {
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

    /// check whether the missing data is in Pending

    let subbedAttemptId;
    let subbedNFT;
    for (let key of metadataPendingKeys) {
      const attemptId = key.split(' ')[4];
      const nftPending: NFTSerializedDataAA = await getVercelNFTPending(
        appId,
        nftId,
        attemptId,
        client
      );

      const nft: NFT = deserializeNFT(nftPending);
      if (nftInited === nft.hash().toString()) {
        subbedAttemptId = attemptId;
        subbedNFT = nft;
      }
    }

    if (subbedAttemptId && subbedNFT) {
      const nftPendingConfirmed = await getVercelMetadataPending(
        appId,
        nftId,
        subbedAttemptId,
        client
      );

      const subbedMetadata = deserializeMetadata(nftPendingConfirmed);
      await setVercelMetadata(appId, subbedMetadata, client);
      await setVercelNFT(appId, subbedNFT, client);
      return true;
    }

    /// check whether the missing data is in AA

    const metadataAAKeys: string[] = await getVercelMetadataAAAllKeys(
      appId,
      nftId,
      client
    );
    const nftAAKeys: string[] = await getVercelNFTAAAllKeys(
      appId,
      nftId,
      client
    );

    if (metadataAAKeys.length !== nftAAKeys.length) {
      throw new Error('db length not matches');
    }

    for (let key of metadataAAKeys) {
      const attemptId = key.split(' ')[4];
      const nftAA: NFTSerializedDataAA = await getVercelNFTAA(
        appId,
        nftId,
        attemptId,
        client
      );

      const nft: NFT = deserializeNFT(nftAA);
      if (nftInited === nft.hash().toString()) {
        const nftAAConfirmed = await getVercelMetadataAA(
          appId,
          nftId,
          attemptId,
          client
        );

        const subbedMetadata = deserializeMetadata(nftAAConfirmed);
        await setVercelMetadata(appId, subbedMetadata, client);
        await setVercelNFT(appId, nft, client);
        return true;
      }
    }
    return false;
  }
  return true;
}
