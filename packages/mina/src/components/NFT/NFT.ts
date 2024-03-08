import {
  Field,
  CircuitString,
  Poseidon,
  PublicKey,
  MerkleMap,
  MerkleMapWitness,
  Struct,
} from 'o1js';

export type NFTMetadata = {
  name: string;
  description: string;
  id: Field;
  cid: string;
  owner: PublicKey;
  isMinted: string;
};

export class NFT extends Struct({
  name: Field,
  description: Field,
  id: Field,
  cid: Field,
  owner: PublicKey,
  isMinted: Field,
}) {
  changeOwner(newAddress: PublicKey) {
    this.owner = newAddress;
  }
  mint() {
    this.isMinted = Field(1);
  }
  hash(): Field {
    return Poseidon.hash(NFT.toFields(this));
  }
}

export function createNFT(nftMetadata: NFTMetadata): NFT {
  if (nftMetadata.description.length > 128) {
    throw new Error('circuit string should be equal or below 128');
  }

  if (nftMetadata.isMinted !== '0' && nftMetadata.isMinted !== '1') {
    throw new Error('not allowed value for isMinted');
  }

  const newNFT: NFT = {
    name: Poseidon.hash(CircuitString.fromString(nftMetadata.name).toFields()),
    description: Poseidon.hash(
      CircuitString.fromString(nftMetadata.description).toFields()
    ),
    id: nftMetadata.id,
    cid: Poseidon.hash(CircuitString.fromString(nftMetadata.cid).toFields()),
    owner: nftMetadata.owner,
    isMinted: Field(nftMetadata.isMinted),
    changeOwner: function (newAddress: PublicKey): void {
      this.owner = newAddress;
    },
    mint: function (): void {
      this.isMinted = Field(1);
    },
    hash: function (): Field {
      return Poseidon.hash(NFT.toFields(this));
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
