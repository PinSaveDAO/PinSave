import { Field, CircuitString, Poseidon, PublicKey, MerkleMap } from 'o1js';

import { NFT } from '../NFTsMapContract.js';

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

export function NFTtoHash(_NFT: NFT): Field {
  return Poseidon.hash(NFT.toFields(_NFT));
}

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

export function generateNftCollection(
  pubKey: PublicKey,
  map: MerkleMap
): MerkleMap {
  const nftName = 'name';
  const nftDescription = 'some random words';
  const nftCid = '1244324dwfew1';

  storeNFT(nftName, nftDescription, Field(10), nftCid, pubKey, map);

  storeNFT(nftName, nftDescription, Field(11), nftCid, pubKey, map);

  storeNFT(nftName, nftDescription, Field(12), nftCid, pubKey, map);

  return map;
}
