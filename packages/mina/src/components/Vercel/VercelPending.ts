import type { VercelKV } from '@vercel/kv';

import { NFT, NFTMetadata } from '../NFT/NFT.js';
import { NFTSerializedDataAA, NFTReducedAA } from './VercelAA.js';

export type NFTSerializedDataPending = NFTSerializedDataAA & {
  txId: string | number;
};

export type NFTReducedPending = NFTReducedAA & { txId: string | number };

export async function getVercelMetadataPending(
  appId: string,
  nftId: number | string,
  attemptId: number | string,
  client: VercelKV
): Promise<NFTSerializedDataPending> {
  const key: string = `${appId} metadata pending ${nftId} ${attemptId}`;
  const nftMetadata: NFTSerializedDataPending | null = await client.hgetall(
    key
  );
  if (nftMetadata) {
    return nftMetadata;
  }
  throw Error('metadata pending not fetched');
}

export async function getVercelNFTPending(
  appId: string,
  nftId: number | string,
  attemptId: number | string,
  client: VercelKV
): Promise<NFTSerializedDataAA> {
  const key: string = `${appId} nft pending ${nftId} ${attemptId}`;
  const nft: NFTSerializedDataAA | null = await client.hgetall(key);
  if (nft) {
    return nft;
  }
  throw Error('nft pending not fetched');
}

export async function setVercelMetadataPending(
  appId: string,
  nftMetadata: NFTMetadata,
  attemptId: number | string,
  txId: number | string,
  client: VercelKV
): Promise<number> {
  const key: string = `${appId} metadata pending ${nftMetadata.id} ${attemptId}`;
  const nftMetadataIdFetched: string | null = await client.hget(key, 'id');
  if (nftMetadataIdFetched) {
    throw Error('metadata pending already exists');
  }
  const res: number = await client.hset(key, {
    ...nftMetadata,
    attemptId: attemptId,
    txId: txId,
  });
  return res;
}

export async function setVercelNFTPending(
  appId: string,
  nft: NFT,
  attemptId: number | string,
  txId: number | string,
  client: VercelKV
): Promise<number> {
  const key: string = `${appId} nft pending ${nft.id} ${attemptId}`;
  const nftIdFetched: string | null = await client.hget(key, 'id');
  if (nftIdFetched) {
    throw Error('nft pending already exists');
  }
  const value: NFTReducedPending = {
    name: nft.name,
    description: nft.description,
    id: nft.id,
    cid: nft.cid,
    owner: nft.owner,
    isMinted: nft.isMinted,
    attemptId: attemptId,
    txId: txId,
  };
  const res: number = await client.hset(key, value);
  return res;
}

export async function getVercelMetadataPendingAll(
  appId: string,
  client: VercelKV
): Promise<string[]> {
  const key: string = `${appId} metadata pending*`;
  const keys: string[] = await client.keys(key);
  return keys;
}

export async function getVercelNFTPendingAllKeys(
  appId: string,
  client: VercelKV
): Promise<string[]> {
  const key: string = `${appId} nft pending*`;
  const keys: string[] = await client.keys(key);
  return keys;
}

export async function getVercelMetadataPendingIdAllKeys(
  appId: string,
  nftId: number | string,
  client: VercelKV
): Promise<string[]> {
  const key: string = `${appId} metadata pending ${nftId}*`;
  const keys: string[] = await client.keys(key);
  return keys;
}

export async function getVercelNFTPendingIdAllKeys(
  appId: string,
  nftId: number | string,
  client: VercelKV
): Promise<string[]> {
  const key: string = `${appId} nft pending ${nftId}*`;
  const keys: string[] = await client.keys(key);
  return keys;
}
