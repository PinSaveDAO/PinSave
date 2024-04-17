import { Field, PublicKey, UInt64, Bool, Struct, Poseidon } from 'o1js';

import { NFT } from '../NFT/NFT';

export type NFTforNFTStruct = {
  nft: NFT;
  owner: PublicKey;
  nftContractAddress: PublicKey;
  askNFTId: Field;
  isCompleted: Bool;
};

export type NFTforMinaStruct = {
  nft: NFT;
  owner: PublicKey;
  nftContractAddress: PublicKey;
  askAmount: UInt64;
  isCompleted: Bool;
};

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
  nftforMinaStruct: NFTforMinaStruct
): NFTforMina {
  const nftforMina: NFTforMina = new NFTforMina({
    nft: nftforMinaStruct.nft,
    owner: nftforMinaStruct.owner,
    nftContractAddress: nftforMinaStruct.nftContractAddress,
    askAmount: nftforMinaStruct.askAmount,
    isCompleted: nftforMinaStruct.isCompleted,
  });
  return nftforMina;
}

export function createNFTforNFT(nftforNFTStruct: NFTforNFTStruct): NFTforNFT {
  const nftforNFT: NFTforNFT = new NFTforNFT({
    nft: nftforNFTStruct.nft,
    owner: nftforNFTStruct.owner,
    nftContractAddress: nftforNFTStruct.nftContractAddress,
    askNFTId: nftforNFTStruct.askNFTId,
    isCompleted: nftforNFTStruct.isCompleted,
  });
  return nftforNFT;
}
