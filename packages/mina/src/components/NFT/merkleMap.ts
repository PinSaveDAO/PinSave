import { Field, PublicKey, MerkleMap } from 'o1js';

import { NFT, NFTMetadata, createNFT } from './NFT.js';
import { NFTSerializedData } from './deserialization.js';

export function stringObjectToNFTMetadata(data: NFTSerializedData): NFT {
  const nftMetadata: NFTMetadata = {
    name: data.name,
    description: data.description,
    cid: data.cid,
    id: Field(data.id),
    owner: PublicKey.fromBase58(data.owner),
    isMinted: data.isMinted,
  };
  const nft: NFT = createNFT(nftMetadata);
  return nft;
}

export function setStringObjectToMap(
  data: NFTSerializedData,
  map: MerkleMap
): boolean {
  const nftObject: NFT = stringObjectToNFTMetadata(data);
  map.set(nftObject.id, nftObject.hash());
  return true;
}

export function setHashedObjectToMap(data: NFT, map: MerkleMap): boolean {
  map.set(data.id, data.hash());
  return true;
}

export function storeNFTMap(nftMetadata: NFTMetadata, map: MerkleMap): NFT {
  const _NFT: NFT = createNFT(nftMetadata);
  map.set(nftMetadata.id, _NFT.hash());
  return _NFT;
}

export function initNFTtoMap(_NFT: NFT, map: MerkleMap): boolean {
  const nftId: Field = _NFT.id;
  const currentValue: string = map.get(nftId).toString();
  if (currentValue !== '0') {
    throw new Error('value already initialized');
  }
  map.set(nftId, _NFT.hash());
  return true;
}

export function mintNFTtoMap(_NFT: NFT, map: MerkleMap): boolean {
  const nftId: Field = _NFT.id;
  const currentValue: Field = map.get(nftId);
  const beforeMint: Field = _NFT.hash();
  if (!currentValue.equals(beforeMint)) {
    throw new Error('value not initialized');
  }
  _NFT.mint();
  const afterMint: Field = _NFT.hash();
  map.set(nftId, afterMint);
  return true;
}
