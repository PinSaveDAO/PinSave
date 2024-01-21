import {
  Field,
  CircuitString,
  Poseidon,
  PublicKey,
  MerkleMap,
  MerkleMapWitness,
} from 'o1js';

import { NFT } from '../NFTsMapContract.js';

export function NFTtoHash(_NFT: NFT): Field {
  return Poseidon.hash(NFT.toFields(_NFT));
}

export function createNFT(
  nftName: string,
  nftDescription: string,
  nftId: Field,
  nftCid: string,
  owner: PublicKey
): NFT {
  const newNFT: NFT = {
    name: Poseidon.hash(CircuitString.fromString(nftName).toFields()),
    description: Poseidon.hash(
      CircuitString.fromString(nftDescription).toFields()
    ),
    id: nftId,
    cid: Poseidon.hash(CircuitString.fromString(nftCid).toFields()),
    owner: owner,
    changeOwner: function (newAddress: PublicKey): void {
      this.owner = newAddress;
    },
  };
  return newNFT;
}

// works only for merkle map
export function createNFTwithWitness(
  nftName: string,
  nftDescription: string,
  nftId: Field,
  nftCid: string,
  owner: PublicKey
): { nft: NFT; nftWitness: MerkleMapWitness } {
  const merkleMap: MerkleMap = new MerkleMap();
  const _NFT: NFT = createNFT(nftName, nftDescription, nftId, nftCid, owner);
  const nftWitness: MerkleMapWitness = merkleMap.getWitness(nftId);
  return { nft: _NFT, nftWitness: nftWitness };
}

// works only for merkle map
export function storeNFT(
  nftName: string,
  nftDescription: string,
  nftId: Field,
  nftCid: string,
  owner: PublicKey,
  map: MerkleMap
): NFT {
  const _NFT: NFT = createNFT(nftName, nftDescription, nftId, nftCid, owner);

  map.set(nftId, NFTtoHash(_NFT));

  return _NFT;
}

// works only for merkle map
export function generateCollection(pubKey: PublicKey, map: MerkleMap) {
  const nftName: string = 'name';
  const nftDescription: string = 'some random words';
  const nftCid: string = '1244324dwfew1';

  const NFT1 = storeNFT(
    nftName,
    nftDescription,
    Field(10),
    nftCid,
    pubKey,
    map
  );

  const NFT2 = storeNFT(
    nftName,
    nftDescription,
    Field(11),
    nftCid,
    pubKey,
    map
  );

  const NFT3 = storeNFT(
    nftName,
    nftDescription,
    Field(12),
    nftCid,
    pubKey,
    map
  );

  return [NFT1, NFT2, NFT3];
}

export function generateCollectionWithMap(pubKey: PublicKey) {
  const map: MerkleMap = new MerkleMap();
  const nftArray = generateCollection(pubKey, map);
  return { map: map, nftArray: nftArray };
}
