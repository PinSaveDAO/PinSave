import type { VercelKV } from '@vercel/kv';

import { NFTSerializedData } from '../NFT/deserialization.js';
import { NFT, NFTReduced, NFTMetadata } from '../NFT/NFT.js';

export type NFTSerializedDataAA = NFTSerializedData & {
  attemptId: string | number;
};

export type NFTReducedAA = NFTReduced & { attemptId: string | number };

export async function getVercelNFTAA(
  appId: string,
  nftId: number | string,
  attemptId: number | string,
  client: VercelKV
): Promise<NFTSerializedDataAA> {
  const key: string = `${appId} nft AA ${nftId} ${attemptId}`;
  const nft: NFTSerializedDataAA | null = await client.hgetall(key);
  if (nft) {
    return nft;
  }
  throw Error('nft AA not fetched');
}

export async function getVercelMetadataAA(
  appId: string,
  nftId: number | string,
  attemptId: number | string,
  client: VercelKV
): Promise<NFTSerializedDataAA> {
  const key: string = `${appId} metadata AA ${nftId} ${attemptId}`;
  const nftMetadata: NFTSerializedDataAA | null = await client.hgetall(key);
  if (nftMetadata) {
    return nftMetadata;
  }
  throw Error('metadata AA not fetched');
}

export async function setVercelNFTAA(
  appId: string,
  nft: NFT,
  attemptId: number | string,
  client: VercelKV
): Promise<number> {
  const key: string = `${appId} nft AA ${nft.id} ${attemptId}`;
  const nftIdFetched: string | null = await client.hget(key, 'id');
  if (nftIdFetched) {
    throw Error('nft AA already exists');
  }
  const value: NFTReducedAA = {
    name: nft.name,
    description: nft.description,
    id: nft.id,
    cid: nft.cid,
    owner: nft.owner,
    isMinted: nft.isMinted,
    attemptId: attemptId,
  };
  const res: number = await client.hset(key, value);
  return res;
}

export async function setVercelMetadataAA(
  appId: string,
  nftMetadata: NFTMetadata,
  attemptId: number | string,
  client: VercelKV
): Promise<number> {
  const key: string = `${appId} metadata AA ${nftMetadata.id} ${attemptId}`;
  const nftMetadataIdFetched: string | null = await client.hget(key, 'id');
  if (nftMetadataIdFetched) {
    throw Error('nft metadata AA already exists');
  }
  const res: number = await client.hset(key, {
    ...nftMetadata,
    attemptId: attemptId,
  });
  return res;
}

export async function getVercelNFTAAAllKeys(
  appId: string,
  nftId: number | string,
  client: VercelKV
): Promise<string[]> {
  const key: string = `${appId} nft AA ${nftId}*`;
  const keys: string[] = await client.keys(key);
  return keys;
}

export async function getVercelMetadataAAAllKeys(
  appId: string,
  nftId: number | string,
  client: VercelKV
): Promise<string[]> {
  const key: string = `${appId} metadata AA ${nftId}*`;
  const keys: string[] = await client.keys(key);
  return keys;
}
