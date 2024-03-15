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
  const key: string = `${appId} metadata: ${nftId}`;
  const nftMetadata: nftDataIn | null = await client.hgetall(key);
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
  const key: string = `${appId} metadata: ${nftMetadata.id}`;
  await client.hset(key, {
    ...nftMetadata,
  });
}

export async function mintVercelMetadata(
  appId: string,
  nftId: string | number,
  client: VercelKV
) {
  const key: string = `${appId} metadata: ${nftId}`;
  await client.hset(key, { isMinted: '1' });
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
    name: nft.name,
    description: nft.description,
    id: nft.id,
    cid: nft.cid,
    owner: nft.owner,
    isMinted: nft.isMinted,
  };
  await client.hset(key, value);
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

export async function mintVercelNFT(
  appId: string,
  nftId: string | number,
  client: VercelKV
) {
  const key: string = `${appId}: ${nftId}`;
  await client.hset(key, { isMinted: '1' });
}

export async function getVercelNFT(
  appId: string,
  nftId: number | string,
  client: VercelKV
) {
  const key: string = `${appId}: ${nftId}`;
  const nft: nftDataIn | null = await client.hgetall(key);
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
