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

export class NFT extends Struct({
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

export type NFTMetadata = {
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

export function NFTtoHash(_NFT: NFT): Field {
  return Poseidon.hash(NFT.toFields(_NFT));
}

export function createNFT(nftMetadata: NFTMetadata): NFT {
  if (nftMetadata.description.length > 128) {
    throw new Error('circuit string should be equal or below 128');
  }

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

export function createNFTWithMapWitness(nftMetadata: NFTMetadata): {
  nft: NFT;
  nftWitness: MerkleMapWitness;
} {
  const merkleMap: MerkleMap = new MerkleMap();
  const _NFT: NFT = createNFT(nftMetadata);
  const nftWitness: MerkleMapWitness = merkleMap.getWitness(nftMetadata.id);
  return { nft: _NFT, nftWitness: nftWitness };
}

export function storeNFTMap(nftMetadata: NFTMetadata, map: MerkleMap) {
  const _NFT: NFT = createNFT(nftMetadata);
  map.set(nftMetadata.id, NFTtoHash(_NFT));
  return _NFT;
}

export function stringObjectToNftMetadata(data: nftDataIn) {
  const nftMetadata: NFTMetadata = {
    name: data.name,
    description: data.description,
    cid: data.cid,
    id: Field(data.id),
    owner: PublicKey.fromBase58(data.owner),
  };
  const nft = createNFT(nftMetadata);
  return nft;
}

export function setStringObjectToMap(data: nftDataIn, map: MerkleMap) {
  const nftObject = stringObjectToNftMetadata(data);
  map.set(nftObject.id, NFTtoHash(nftObject));
}

export function setHashedObjectToMap(data: NFT, map: MerkleMap) {
  map.set(data.id, NFTtoHash(data));
}

export function deserializeNFT(data: nftDataIn) {
  const dataOut: NFT = {
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
  const arrayLength = nftArray.length;
  for (let i = 0; i < arrayLength; i++) {
    const nftId = nftArray[i];

    const data: nftDataIn = await getVercelMetadata(appId, nftId, client);
    setStringObjectToMap(data, map);
  }
  return map;
}

export async function setVercelNFT(
  appId: string | PublicKey,
  nft: NFT,
  client: VercelKV
) {
  await client.set(`${appId}: ${nft.id}`, {
    ...nft,
  });
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

export async function getVercelNFT(
  appId: string,
  nftId: number | string,
  client: VercelKV
) {
  const nft: nftDataIn | null = await client.get(`${appId}: ${nftId}`);
  if (nft) {
    return nft;
  }
  throw Error('nft not fetched');
}

export async function setVercelMetadata(
  appId: string,
  nftMetadata: NFTMetadata,
  client: VercelKV
) {
  const query = `${appId} metadata: ${nftMetadata.id}`;
  await client.hset(query, {
    ...nftMetadata,
  });
}

export async function getVercelMetadata(
  appId: string,
  nftId: number | string,
  client: VercelKV
) {
  const query = `${appId} metadata: ${nftId}`;
  const nftMetadata: nftDataIn | null = await client.hgetall(query);
  if (nftMetadata) {
    return nftMetadata;
  }
  throw Error('nft metadata not fetched');
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

export function generateDummyCollectionMap(pubKey: PublicKey, map: MerkleMap) {
  const nftArray: NFT[] = [];
  const nftMetadataArray: NFTMetadata[] = [];

  for (let i = 0; i <= 2; i++) {
    // Generate NFT metadata
    const nftMetadata = generateDummyNFTMetadata(i, pubKey);

    // Store NFT in the Merkle map
    const nft = storeNFTMap(nftMetadata, map);

    // Add the NFT and its metadata to the arrays
    nftArray.push(nft);
    nftMetadataArray.push(nftMetadata);
  }
  return {
    nftArray: nftArray,
    nftMetadata: nftMetadataArray,
  };
}

export function generateDummyCollectionWithMap(pubKey: PublicKey) {
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
  };
  return nftMetadata;
}

export function generateDummyNFT(id: number, pubKey: PublicKey) {
  const nftMetadata = generateDummyNFTMetadata(id, pubKey);
  const nftHashed = createNFT(nftMetadata);
  return { nftHashed: nftHashed, nftMetadata: nftMetadata };
}
