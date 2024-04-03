import { MerkleMap } from 'o1js';
import { VercelKV } from '@vercel/kv';

import { nftDataIn, deserializeNFT } from './deserialization.js';
import { setHashedObjectToMap, setStringObjectToMap } from './merkleMap.js';
import { NFT, NFTMetadata, NFTReduced } from './NFT.js';

export async function getVercelMetadata(
  appId: string,
  nftId: number | string,
  client: VercelKV
): Promise<nftDataIn> {
  const key: string = `${appId} metadata ${nftId}`;
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
): Promise<number> {
  const key: string = `${appId} metadata ${nftMetadata.id}`;
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

export async function mintVercelMetadata(
  appId: string,
  nftId: string | number,
  client: VercelKV
): Promise<number> {
  const key: string = `${appId} metadata: ${nftId}`;
  const res: number = await client.hset(key, { isMinted: '1' });
  return res;
}

export async function getVercelNFT(
  appId: string,
  nftId: number | string,
  client: VercelKV
): Promise<nftDataIn> {
  const key: string = `${appId} nft ${nftId}`;
  const nft: nftDataIn | null = await client.hgetall(key);
  if (nft) {
    return nft;
  }
  throw Error('nft not fetched');
}

export async function setVercelNFT(
  appId: string,
  nft: NFT,
  client: VercelKV
): Promise<number> {
  const key: string = `${appId} nft ${nft.id}`;
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

export async function mintVercelNFT(
  appId: string,
  nftId: string | number,
  client: VercelKV
): Promise<number> {
  const key: string = `${appId} nft ${nftId}`;
  const res: number = await client.hset(key, { isMinted: '1' });
  return res;
}

export async function getMapFromVercelNFTs(
  appId: string,
  nftArray: number[],
  client: VercelKV
): Promise<MerkleMap> {
  const map: MerkleMap = new MerkleMap();
  const arrayLength: number = nftArray.length;
  for (let i = 0; i < arrayLength; i++) {
    const nftId: number = nftArray[i];
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
): Promise<MerkleMap> {
  const map: MerkleMap = new MerkleMap();
  const arrayLength: number = nftArray.length;
  for (let i = 0; i < arrayLength; i++) {
    const nftId: number = nftArray[i];
    const data: nftDataIn = await getVercelMetadata(appId, nftId, client);
    setStringObjectToMap(data, map);
  }
  return map;
}

export type CommentData = {
  publicKey: string;
  data: string;
  postId: string | number;
};

export async function getVercelComment(
  appId: string,
  postId: string | number,
  commentId: string | number,
  client: VercelKV
): Promise<CommentData> {
  const key: string = `${appId} ${postId} comment ${commentId} `;
  const comment: CommentData | null = await client.hgetall(key);
  if (comment) {
    return comment;
  }
  throw Error('comment not fetched');
}

export async function setVercelComment(
  appId: string,
  post: CommentData,
  client: VercelKV
): Promise<number> {
  const postId: string | number = post.postId;
  const commentId: number = await getVercelCommentsPostLength(
    appId,
    postId,
    client
  );
  const key: string = `${appId} ${postId} comment ${commentId} `;
  const res: number = await client.hset(key, { ...post, key: commentId });
  return res;
}

export async function getVercelPostComments(
  appId: string,
  postId: string | number,
  client: VercelKV
): Promise<CommentData[]> {
  const commentId: number = await getVercelCommentsPostLength(
    appId,
    postId,
    client
  );
  let output: CommentData[] = [];
  for (let i = 0; i < commentId; i++) {
    output.push(await getVercelComment(appId, postId, i, client));
  }
  return output;
}

export async function getVercelCommentsPostLength(
  appId: string,
  postId: string | number,
  client: VercelKV
): Promise<number> {
  const key: string = `${appId} ${postId} comment*`;
  const keys: string[] = await client.keys(key);
  if (!keys) {
    throw new Error('no keys found');
  }
  return keys.length;
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
