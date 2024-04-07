import type { VercelKV } from '@vercel/kv';
import { MerkleMap } from 'o1js';

import { NFTSerializedData, deserializeNFT } from '../NFT/deserialization.js';
import {
  setHashedObjectToMap,
  setStringObjectToMap,
} from '../NFT/merkleMap.js';
import { NFT } from '../NFT/NFT.js';
import { getVercelNFT, getVercelMetadata } from './vercel.js';

export async function getMapFromVercelNFTs(
  appId: string,
  nftArray: number[],
  client: VercelKV
): Promise<MerkleMap> {
  const map: MerkleMap = new MerkleMap();
  const arrayLength: number = nftArray.length;
  for (let i = 0; i < arrayLength; i++) {
    const nftId: number = nftArray[i];
    const data: NFTSerializedData = await getVercelNFT(appId, nftId, client);
    const dataOut: NFT = deserializeNFT(data);
    setHashedObjectToMap(dataOut, map);
  }
  return map;
}

export async function getMapFromVercelMetadata(
  appId: string,
  nftArray: number[],
  client: VercelKV
): Promise<MerkleMap> {
  const map: MerkleMap = new MerkleMap();
  const arrayLength: number = nftArray.length;
  for (let i = 0; i < arrayLength; i++) {
    const nftId: number = nftArray[i];
    const data: NFTSerializedData = await getVercelMetadata(
      appId,
      nftId,
      client
    );
    setStringObjectToMap(data, map);
  }
  return map;
}
