import {
  Field,
  CircuitString,
  Poseidon,
  PublicKey,
  MerkleMap,
  MerkleMapWitness,
  Struct,
} from 'o1js';

import { NFT } from '../NFTsMapContract.js';
import { VercelKV } from '@vercel/kv';

export type nftMetadata = {
  name: string;
  description: string;
  id: Field;
  cid: string;
  owner: PublicKey;
};

export class NftReduced extends Struct({
  name: Field,
  description: Field,
  id: Field,
  cid: Field,
  owner: PublicKey,
}) {}

export type nftMetadataIn = {
  name: string;
  description: string;
  id: string;
  cid: string;
  owner: string;
} | null;

export function NFTtoHash(_NFT: NftReduced): Field {
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

export function setStringObjectToMap(data: nftMetadataIn, map: MerkleMap) {
  if (data) {
    const nftObject: NftReduced = {
      name: Field(data.name),
      description: Field(data.description),
      cid: Field(data.cid),
      id: Field(data.id),
      owner: PublicKey.fromBase58(data.owner),
    };

    map.set(Field(data.id), NFTtoHash(nftObject));
    return true;
  }
  return false;
}

export async function setMapFromVercel(nftArray: number[], client: VercelKV) {
  const map: MerkleMap = new MerkleMap();
  const arrayLength = nftArray.length;
  for (let i = 0; i < arrayLength; i++) {
    const nftId = nftArray[i];
    const data: nftMetadataIn = await client.get(`nft: ${nftId}`);
    setStringObjectToMap(data, map);
  }
  return map;
}

export async function setVercelNft(nftId: Field, client: VercelKV, nft: NFT) {
  const _nftId = Number(nftId);
  await client.set(`nft: ${_nftId}`, {
    ...nft,
  });
}

export async function setNftsToVercel(nftArray: NFT[], client: VercelKV) {
  for (let i = 0; i < nftArray.length; i++) {
    await setVercelNft(nftArray[i].id, client, nftArray[i]);
  }
}

export function generateDummyCollectionMap(pubKey: PublicKey, map: MerkleMap) {
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

export function generateDummyCollectionWithMap(pubKey: PublicKey) {
  const map: MerkleMap = new MerkleMap();
  const nftArray = generateDummyCollectionMap(pubKey, map);
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
