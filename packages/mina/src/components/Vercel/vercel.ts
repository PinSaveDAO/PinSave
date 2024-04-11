import type { VercelKV } from '@vercel/kv';

import { NFTSerializedData } from '../NFT/deserialization.js';
import { NFT, NFTMetadata, NFTReduced } from '../NFT/NFT.js';

export async function getVercelNFT(
  appId: string,
  nftId: number | string,
  client: VercelKV
): Promise<NFTSerializedData> {
  const key: string = `${appId} nft: ${nftId}`;
  const nft: NFTSerializedData | null = await client.hgetall(key);
  if (nft) {
    return nft;
  }
  throw Error('nft not fetched');
}

export async function getVercelMetadata(
  appId: string,
  nftId: number | string,
  client: VercelKV
): Promise<NFTSerializedData> {
  const key: string = `${appId} metadata: ${nftId}`;
  const nftMetadata: NFTSerializedData | null = await client.hgetall(key);
  if (nftMetadata) {
    return nftMetadata;
  }
  throw Error('nft metadata not fetched');
}

export async function setVercelNFT(
  appId: string,
  nft: NFT,
  client: VercelKV
): Promise<number> {
  const key: string = `${appId} nft: ${nft.id}`;
  const nftIdFetched: string | null = await client.hget(key, 'id');
  if (nftIdFetched) {
    throw Error('nft already exists');
  }
  const value: NFTReduced = {
    name: nft.name,
    description: nft.description,
    id: nft.id,
    cid: nft.cid,
    owner: nft.owner,
    isMinted: nft.isMinted,
  };
  const res: number = await client.hset(key, value);
  return res;
}

export async function setVercelMetadata(
  appId: string,
  nftMetadata: NFTMetadata,
  client: VercelKV
): Promise<number> {
  const key: string = `${appId} metadata: ${nftMetadata.id}`;
  const nftMetadataIdFetched: string | null = await client.hget(key, 'id');
  if (nftMetadataIdFetched) {
    throw Error('nft metadata already exists');
  }
  const res: number = await client.hset(key, {
    ...nftMetadata,
  });
  return res;
}

export async function setMetadatasToVercel(
  appId: string,
  nftArray: NFTMetadata[],
  client: VercelKV
): Promise<boolean> {
  for (let i = 0; i < nftArray.length; i++) {
    await setVercelMetadata(appId, nftArray[i], client);
  }
  return true;
}

export async function getVercelNFTAllKeys(
  appId: string,
  client: VercelKV
): Promise<string[]> {
  const key: string = `${appId} nft:*`;
  const keys: string[] = await client.keys(key);
  return keys;
}

export async function setNFTsToVercel(
  appId: string,
  nftArray: NFT[],
  client: VercelKV
): Promise<boolean> {
  for (let i = 0; i < nftArray.length; i++) {
    await setVercelNFT(appId, nftArray[i], client);
  }
  return true;
}

export async function getVercelMetadataAllKeys(
  appId: string,
  client: VercelKV
): Promise<string[]> {
  const key: string = `${appId} metadata:*`;
  const keys: string[] = await client.keys(key);
  return keys;
}

export async function deleteVercelDataExceptAppId(
  appId: string,
  client: VercelKV
) {
  const allKeys: string[] = await client.keys(`*`);
  for (let str of allKeys) {
    if (!str.startsWith(`${appId}`)) {
      await client.del(str);
    }
  }
  return allKeys;
}

export async function deleteVercelKey(key: string, client: VercelKV) {
  await client.del(key);
}

export async function getVercelKey(key: string, client: VercelKV) {
  return await client.hgetall(key);
}
