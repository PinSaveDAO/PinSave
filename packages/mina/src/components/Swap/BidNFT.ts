import { Field, PublicKey, UInt64, Bool, Struct, Poseidon } from 'o1js';

import { NFT } from '../NFT/NFT';

export class NFTforMina extends Struct({
  nft: NFT,
  owner: PublicKey,
  nftContractAddress: PublicKey,
  askAmount: UInt64,
  isCompleted: Bool,
}) {
  changeOwner(newOwner: PublicKey) {
    this.owner = newOwner;
  }
  completeTransaction() {
    this.isCompleted = Bool(true);
  }
  toFields(): Field[] {
    return NFTforMina.toFields(this);
  }
  hash(): Field {
    return Poseidon.hash(NFTforMina.toFields(this));
  }
}

export class NFTforNFT extends Struct({
  nft: NFT,
  owner: PublicKey,
  nftContractAddress: PublicKey,
  askNFTId: Field,
  isCompleted: Bool,
}) {
  changeOwner(newOwner: PublicKey) {
    this.owner = newOwner;
  }
  completeTransaction() {
    this.isCompleted = Bool(true);
  }
  toFields(): Field[] {
    return NFTforNFT.toFields(this);
  }
  hash(): Field {
    return Poseidon.hash(NFTforNFT.toFields(this));
  }
}

export function createNFTforMina(
  nft: NFT,
  owner: PublicKey,
  nftContractAddress: PublicKey,
  askAmount: UInt64,
  isCompleted: Bool = Bool(false)
) {
  const nftforMina: NFTforMina = new NFTforMina({
    nft: nft,
    owner: owner,
    nftContractAddress: nftContractAddress,
    askAmount: askAmount,
    isCompleted: isCompleted,
  });
  return nftforMina;
}

export function createNFTforNFT(
  nft: NFT,
  owner: PublicKey,
  nftContractAddress: PublicKey,
  askNFTId: Field,
  isCompleted: Bool = Bool(false)
) {
  const nftforNFT: NFTforNFT = new NFTforNFT({
    nft: nft,
    owner: owner,
    nftContractAddress: nftContractAddress,
    askNFTId: askNFTId,
    isCompleted: isCompleted,
  });
  return nftforNFT;
}
