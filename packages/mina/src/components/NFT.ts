import {
  Field,
  CircuitString,
  Poseidon,
  PublicKey,
  MerkleMap,
  MerkleMapWitness,
  Struct,
} from 'o1js';
import { VercelKV } from '@vercel/kv';

export class Nft extends Struct({
  name: Field,
  description: Field,
  id: Field,
  cid: Field,
  owner: PublicKey,
}) {
  changeOwner(newAddress: PublicKey) {
    this.owner = newAddress;
  }
}

export type NftReduced = {
  name: Field;
  description: Field;
  id: Field;
  cid: Field;
  owner: PublicKey;
};

export type nftMetadata = {
  name: string;
  description: string;
  id: Field;
  cid: string;
  owner: PublicKey;
};

export type nftDataIn = {
  name: string;
  description: string;
  id: string;
  cid: string;
  owner: string;
};

export function NFTtoHash(_NFT: NftReduced): Field {
  return Poseidon.hash(Nft.toFields(_NFT));
}

export function createNft(nftMetadata: nftMetadata): Nft {
  const newNFT: Nft = {
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
  nft: Nft;
  nftWitness: MerkleMapWitness;
} {
  const merkleMap: MerkleMap = new MerkleMap();
  const _NFT: Nft = createNft(nftMetadata);
  const nftWitness: MerkleMapWitness = merkleMap.getWitness(nftMetadata.id);
  return { nft: _NFT, nftWitness: nftWitness };
}

export function storeNftMap(
  nftMetadata: nftMetadata,
  map: MerkleMap
): { nft: Nft; nftMetadata: nftMetadata } {
  const _NFT: Nft = createNft(nftMetadata);
  map.set(nftMetadata.id, NFTtoHash(_NFT));
  return { nft: _NFT, nftMetadata: nftMetadata };
}

export function stringObjectToNftMetadata(data: nftDataIn) {
  const nftMetadata: nftMetadata = {
    name: data.name,
    description: data.description,
    cid: data.cid,
    id: Field(data.id),
    owner: PublicKey.fromBase58(data.owner),
  };
  const nft = createNft(nftMetadata);
  return nft;
}

export function setStringObjectToMap(data: nftDataIn, map: MerkleMap) {
  const nftObject = stringObjectToNftMetadata(data);
  map.set(nftObject.id, NFTtoHash(nftObject));
}

export function setHashedObjectToMap(data: NftReduced, map: MerkleMap) {
  map.set(data.id, NFTtoHash(data));
}

export function deserializeNft(data: nftDataIn) {
  const dataOut = {
    name: Field(data.name),
    description: Field(data.description),
    cid: Field(data.cid),
    id: Field(data.id),
    owner: PublicKey.fromBase58(data.owner),
    changeOwner: function (newAddress: PublicKey): void {
      this.owner = newAddress;
    },
  };
  return dataOut;
}

export async function getMapFromVercelNfts(
  nftArray: number[],
  client: VercelKV
) {
  const map: MerkleMap = new MerkleMap();
  const arrayLength = nftArray.length;

  for (let i = 0; i < arrayLength; i++) {
    const nftId = nftArray[i];

    const data: nftDataIn = await getVercelNft(nftId, client);

    const dataOut = deserializeNft(data);

    setHashedObjectToMap(dataOut, map);
  }
  return map;
}

export async function getMapFromVercelMetadata(
  nftArray: number[],
  client: VercelKV
) {
  const map: MerkleMap = new MerkleMap();
  const arrayLength = nftArray.length;
  for (let i = 0; i < arrayLength; i++) {
    const nftId = nftArray[i];

    const data: nftDataIn = await getVercelMetadata(nftId, client);
    setStringObjectToMap(data, map);
  }
  return map;
}

export async function setVercelNft(nftId: Field, client: VercelKV, nft: Nft) {
  await client.set(`nft: ${nftId}`, {
    ...nft,
  });
}

export async function setNftsToVercel(nftArray: Nft[], client: VercelKV) {
  for (let i = 0; i < nftArray.length; i++) {
    await setVercelNft(nftArray[i].id, client, nftArray[i]);
  }
}

export async function getVercelNft(nftId: number | string, client: VercelKV) {
  const nft: nftDataIn | null = await client.get(`nft: ${nftId}`);
  if (nft) {
    return nft;
  }
  throw Error('nft not fetched');
}

export async function setVercelMetadata(
  nftId: Field,
  client: VercelKV,
  nftMetadata: nftMetadata
) {
  await client.hset(`nft metadata: ${nftId}`, {
    ...nftMetadata,
  });
}

export async function getVercelMetadata(
  nftId: number | string,
  client: VercelKV
) {
  const nftMetadata: nftDataIn | null = await client.hgetall(
    `nft metadata: ${nftId}`
  );
  if (nftMetadata) {
    return nftMetadata;
  }
  throw Error('nft metadata not fetched');
}

export async function setMetadatasToVercel(
  nftArray: nftMetadata[],
  client: VercelKV
) {
  for (let i = 0; i < nftArray.length; i++) {
    await setVercelMetadata(nftArray[i].id, client, nftArray[i]);
  }
}

export function generateDummyCollectionMap(pubKey: PublicKey, map: MerkleMap) {
  const nftMetadata1 = generateDummyNftMetadata(10, pubKey);
  const NFT1 = storeNftMap(nftMetadata1, map);

  const nftMetadata2 = generateDummyNftMetadata(11, pubKey);
  const NFT2 = storeNftMap(nftMetadata2, map);

  const nftMetadata3 = generateDummyNftMetadata(12, pubKey);
  const NFT3 = storeNftMap(nftMetadata3, map);
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
    cid: 'bafybeigispuqjylk3zric72nmnuzrpbkmeqzaennraw4crpyrjtdd3nguy',
    owner: pubKey,
  };
  return nftMetadata;
}

export function generateDummyNft(id: number, pubKey: PublicKey): Nft {
  const nftMetadata = generateDummyNftMetadata(id, pubKey);
  const nft = createNft(nftMetadata);
  return nft;
}
