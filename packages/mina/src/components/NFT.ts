import { NFT } from '../NFTsMapContract.js';
import { Field, CircuitString, Poseidon, PublicKey } from 'o1js';

export function createNFT(
  nftName: string,
  nftDescription: string,
  id: Field,
  nftCid: string,
  owner: PublicKey
) {
  const newNFT: NFT = {
    name: Poseidon.hash(CircuitString.fromString(nftName).toFields()),
    description: Poseidon.hash(
      CircuitString.fromString(nftDescription).toFields()
    ),
    id: id,
    cid: Poseidon.hash(CircuitString.fromString(nftCid).toFields()),
    owner: owner,
    changeOwner: function (newAddress: PublicKey): void {
      this.owner = newAddress;
    },
  };
  return newNFT;
}

export function NFTtoHash(_NFT: NFT) {
  return Poseidon.hash(NFT.toFields(_NFT));
}
