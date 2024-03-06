import { MerkleMap } from 'o1js';
import { VercelKV } from '@vercel/kv';

import { nftDataIn, deserializeNFT } from './deserialization.js';
import { setHashedObjectToMap, setStringObjectToMap } from './merkleMap.js';
import { NFT, NFTMetadata } from './NFT.js';

export async function getVercelMetadata(
  appId: string,
  nftId: number | string,
  client: VercelKV
) {
  const query: string = `${appId} metadata: ${nftId}`;
  const nftMetadata: nftDataIn | null = await client.hgetall(query);
  if (nftMetadata) {
    return nftMetadata;
  }
  throw Error('nft metadata not fetched');
}

export async function setVercelMetadata(
  appId: string,
  nftMetadata: NFTMetadata,
  client: VercelKV
) {
  const query: string = `${appId} metadata: ${nftMetadata.id}`;
  await client.hset(query, {
    ...nftMetadata,
  });
}

export async function setMetadatasToVercel(
  appId: string,
  nftArray: NFTMetadata[],
  client: VercelKV
) {
  for (let i = 0; i < nftArray.length; i++) {
    await setVercelMetadata(appId, nftArray[i], client);
  }
}

export async function setVercelNFT(appId: string, nft: NFT, client: VercelKV) {
  const key: string = `${appId}: ${nft.id}`;
  const value = {
    ...nft,
  };
  await client.set(key, value);
}

export async function setNFTsToVercel(
  appId: string,
  nftArray: NFT[],
  client: VercelKV
) {
  for (let i = 0; i < nftArray.length; i++) {
    await setVercelNFT(appId, nftArray[i], client);
  }
}

export async function getVercelNFT(
  appId: string,
  nftId: number | string,
  client: VercelKV
) {
  const key: string = `${appId}: ${nftId}`;
  const nft: nftDataIn | null = await client.get(key);
  if (nft) {
    return nft;
  }
  throw Error('nft not fetched');
}

export async function getMapFromVercelNFTs(
  appId: string,
  nftArray: number[],
  client: VercelKV
) {
  const map: MerkleMap = new MerkleMap();
  const arrayLength = nftArray.length;

  for (let i = 0; i < arrayLength; i++) {
    const nftId = nftArray[i];
    const data: nftDataIn = await getVercelNFT(appId, nftId, client);
    const dataOut: NFT = deserializeNFT(data);
    setHashedObjectToMap(dataOut, map);
  }
  return map;
}

export async function getMapFromVercelMetadata(
  appId: string,
  nftArray: number[],
  client: VercelKV
) {
  const map: MerkleMap = new MerkleMap();
  const arrayLength: number = nftArray.length;
  for (let i = 0; i < arrayLength; i++) {
    const nftId: number = nftArray[i];

    const data: nftDataIn = await getVercelMetadata(appId, nftId, client);
    setStringObjectToMap(data, map);
  }
  return map;
}
