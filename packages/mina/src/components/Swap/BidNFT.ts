import { Field, PublicKey, UInt64, Bool, Struct, Poseidon } from 'o1js';

import { NFT } from '../NFT/NFT';

export class NFTforMina extends Struct({
  nft: NFT,
  owner: PublicKey,
  contract: PublicKey,
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
  contract: PublicKey,
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
