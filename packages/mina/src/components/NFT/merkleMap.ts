import { Field, PublicKey, MerkleMap, Poseidon } from 'o1js';

import { NFT, NFTMetadata, createNFT } from './NFT.js';
import { nftDataIn } from './deserialization.js';

export function NFTtoHash(_NFT: NFT): Field {
  return Poseidon.hash(NFT.toFields(_NFT));
}

export function stringObjectToNFTMetadata(data: nftDataIn) {
  const nftMetadata: NFTMetadata = {
    name: data.name,
    description: data.description,
    cid: data.cid,
    id: Field(data.id),
    owner: PublicKey.fromBase58(data.owner),
    isMinted: data.isMinted,
  };
  const nft = createNFT(nftMetadata);
  return nft;
}

export function setStringObjectToMap(data: nftDataIn, map: MerkleMap) {
  const nftObject = stringObjectToNFTMetadata(data);
  map.set(nftObject.id, NFTtoHash(nftObject));
}

export function setHashedObjectToMap(data: NFT, map: MerkleMap) {
  map.set(data.id, NFTtoHash(data));
}

export function storeNFTMap(nftMetadata: NFTMetadata, map: MerkleMap) {
  const _NFT: NFT = createNFT(nftMetadata);
  map.set(nftMetadata.id, NFTtoHash(_NFT));
  return _NFT;
}
