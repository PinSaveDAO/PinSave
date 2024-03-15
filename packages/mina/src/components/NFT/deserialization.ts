import { Field, PublicKey, Poseidon } from 'o1js';

import { NFT } from './NFT.js';

export type nftDataIn = {
  name: string;
  description: string;
  id: string;
  cid: string;
  owner: string;
  isMinted: string;
};

export function deserializeNFT(data: nftDataIn) {
  const dataOut: NFT = {
    name: Field(data.name),
    description: Field(data.description),
    cid: Field(data.cid),
    id: Field(data.id),
    owner: PublicKey.fromBase58(data.owner),
    isMinted: Field(data.isMinted),
    changeOwner: function (newAddress: PublicKey): void {
      this.owner = newAddress;
    },
    mint: function (): void {
      this.isMinted = Field(1);
    },
    toFields: function (): Field[] {
      return NFT.toFields(this);
    },
    hash: function (): Field {
      return Poseidon.hash(NFT.toFields(this));
    },
  };
  return dataOut;
}
