import {
  Field,
  CircuitString,
  Poseidon,
  PublicKey,
  MerkleMap,
  MerkleMapWitness,
} from 'o1js';

import { NFT } from '../NFTsMapContract.js';

export type nftMetadata = {
  name: string;
  description: string;
  id: Field;
  cid: string;
  owner: PublicKey;
};

export function NFTtoHash(_NFT: NFT): Field {
  return Poseidon.hash(NFT.toFields(_NFT));
}

export function createNft(nftMetadata: nftMetadata): NFT {
  const newNFT: NFT = {
    name: Poseidon.hash(CircuitString.fromString(nftMetadata.name).toFields()),
    description: Poseidon.hash(
      CircuitString.fromString(nftMetadata.description).toFields()
    ),
    id: nftMetadata.id,
    cid: Poseidon.hash(CircuitString.fromString(nftMetadata.cid).toFields()),
    owner: nftMetadata.owner,
    changeOwner: function (newAddress: PublicKey): void {
      this.owner = newAddress;
    },
  };
  return newNFT;
}

export function createNftWithMapWitness(nftMetadata: nftMetadata): {
  nft: NFT;
  nftWitness: MerkleMapWitness;
} {
  const merkleMap: MerkleMap = new MerkleMap();
  const _NFT: NFT = createNft(nftMetadata);
  const nftWitness: MerkleMapWitness = merkleMap.getWitness(nftMetadata.id);
  return { nft: _NFT, nftWitness: nftWitness };
}

export function storeNftMap(
  nftMetadata: nftMetadata,
  map: MerkleMap
): { nft: NFT; nftMetadata: nftMetadata } {
  const _NFT: NFT = createNft(nftMetadata);

  map.set(nftMetadata.id, NFTtoHash(_NFT));

  return { nft: _NFT, nftMetadata: nftMetadata };
}

export function generateCollectionMap(pubKey: PublicKey, map: MerkleMap) {
  var nftMetadata = generateDummyNftMetadata(10, pubKey);

  const NFT1 = storeNftMap(nftMetadata, map);

  nftMetadata.id = Field(11);
  const NFT2 = storeNftMap(nftMetadata, map);

  nftMetadata.id = Field(12);
  const NFT3 = storeNftMap(nftMetadata, map);

  return {
    nftArray: [NFT1.nft, NFT2.nft, NFT3.nft],
    nftMetadata: [NFT1.nftMetadata, NFT2.nftMetadata, NFT3.nftMetadata],
  };
}

export function generateCollectionWithMap(pubKey: PublicKey) {
  const map: MerkleMap = new MerkleMap();
  const nftArray = generateCollectionMap(pubKey, map);
  return { map: map, nftArray: nftArray };
}

export function generateDummyNftMetadata(
  id: number,
  pubKey: PublicKey
): nftMetadata {
  const nftMetadata = {
    name: 'name',
    description: 'some random words',
    id: Field(id),
    cid: '1244324dwfew1',
    owner: pubKey,
  };
  return nftMetadata;
}

export function generateDummyNft(id: number, pubKey: PublicKey): NFT {
  const nftMetadata = generateDummyNftMetadata(id, pubKey);
  const nft = createNft(nftMetadata);
  return nft;
}
