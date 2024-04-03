import { Field, PublicKey, MerkleMap } from 'o1js';

import { storeNFTMap } from './merkleMap.js';
import { NFT, NFTMetadata, createNFT } from './NFT.js';

export function generateDummyCollectionMap(
  pubKey: PublicKey,
  map: MerkleMap,
  totalNumber: number = 2
): {
  nftArray: NFT[];
  nftMetadata: NFTMetadata[];
} {
  let nftArray: NFT[] = [];
  let nftMetadataArray: NFTMetadata[] = [];
  for (let i = 0; i <= totalNumber; i++) {
    const nftMetadata: NFTMetadata = generateDummyNFTMetadata(i, pubKey);
    const nft: NFT = storeNFTMap(nftMetadata, map);
    nftArray.push(nft);
    nftMetadataArray.push(nftMetadata);
  }
  return {
    nftArray: nftArray,
    nftMetadata: nftMetadataArray,
  };
}

export function generateDummyCollectionWithMap(pubKey: PublicKey): {
  nftArray: NFT[];
  nftMetadata: NFTMetadata[];
  map: MerkleMap;
} {
  const map: MerkleMap = new MerkleMap();
  const nftArray = generateDummyCollectionMap(pubKey, map);
  return { map: map, ...nftArray };
}

export function generateDummyNFTMetadata(
  id: number,
  pubKey: PublicKey
): NFTMetadata {
  const nftMetadata = {
    name: 'DSPYT - into CodeVerse',
    description:
      'Join our community to explore the latest trends in data science, share insights on blockchain technology, and participate in DAO',
    id: Field(id),
    cid: 'https://dspyt.com/DSPYT.png',
    owner: pubKey,
    isMinted: '0',
  };
  return nftMetadata;
}

export function generateDummyNFT(
  id: number,
  pubKey: PublicKey
): {
  nftArray: NFT;
  nftMetadata: NFTMetadata;
} {
  const nftMetadata: NFTMetadata = generateDummyNFTMetadata(id, pubKey);
  const nftArray: NFT = createNFT(nftMetadata);
  return { nftArray: nftArray, nftMetadata: nftMetadata };
}
