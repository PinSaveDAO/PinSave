import { Field, PublicKey, Poseidon, CircuitString } from 'o1js';

import { NFT, NFTMetadata, NFTReduced } from './NFT.js';
import { NFTSerializedDataAA } from '../Vercel/vercel.js';

export type NFTSerializedData = {
  name: string;
  description: string;
  id: string;
  cid: string;
  owner: string;
  isMinted: string;
};

export type NFTAA = NFTReduced & {
  attemptId: string | number;
};

export type NFTMetadataAA = NFTMetadata & {
  attemptId: string | number;
};

export function deserializeNFT(data: NFTSerializedData): NFT {
  const dataOut: NFT = new NFT({
    name: Field(data.name),
    description: Field(data.description),
    cid: Field(data.cid),
    id: Field(data.id),
    owner: PublicKey.fromBase58(data.owner),
    isMinted: Field(data.isMinted),
  });
  return dataOut;
}

export function deserializeMetadata(data: NFTSerializedData): NFTMetadata {
  const dataOut: NFTMetadata = {
    name: data.name,
    description: data.description,
    cid: data.cid,
    id: Field(data.id),
    owner: PublicKey.fromBase58(data.owner),
    isMinted: data.isMinted,
  };
  return dataOut;
}

export function createNFTFromStrings(nftMetadata: NFTSerializedDataAA): NFT {
  if (nftMetadata.description.length > 128) {
    throw new Error('circuit string should be equal or below 128');
  }
  if (nftMetadata.isMinted !== '0' && nftMetadata.isMinted !== '1') {
    throw new Error('not allowed value for isMinted');
  }
  const newNFT: NFT = new NFT({
    name: Poseidon.hash(CircuitString.fromString(nftMetadata.name).toFields()),
    description: Poseidon.hash(
      CircuitString.fromString(nftMetadata.description).toFields()
    ),
    id: Field(nftMetadata.id),
    cid: Poseidon.hash(CircuitString.fromString(nftMetadata.cid).toFields()),
    owner: PublicKey.fromBase58(nftMetadata.owner),
    isMinted: Field(nftMetadata.isMinted),
  });
  return newNFT;
}

export function deserializeNFTAA(
  data: NFTSerializedData,
  attemptId: string | number
): NFTAA {
  const deserializedNFT: NFT = deserializeNFT(data);
  const NFTAA: NFTAA = {
    ...deserializedNFT,
    attemptId: attemptId,
  };
  return NFTAA;
}

export function deserializeNFTMetadataAA(
  data: NFTSerializedData,
  attemptId: string | number
) {
  const deserializedMetadata: NFTMetadata = deserializeMetadata(data);
  const NFTMetadataAA: NFTMetadataAA = {
    ...deserializedMetadata,
    attemptId: attemptId,
  };
  return NFTMetadataAA;
}
