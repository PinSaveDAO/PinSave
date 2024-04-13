import { Struct, MerkleMapWitness, Signature } from 'o1js';

import { NFTforMina, NFTforNFT } from './BidNFT';

export class SupplyNFTforMina extends Struct({
  nftOrder: NFTforMina,
  swapContractKeyWitness: MerkleMapWitness,
  swapContractAdminSignature: Signature,
  nftKeyWitness: MerkleMapWitness,
  nftContractNFTAdminSignature: Signature,
}) {}

export class SupplyNFTforNFT extends Struct({
  nftOrder: NFTforNFT,
  swapContractKeyWitness: MerkleMapWitness,
  swapContractAdminSignature: Signature,
  nftKeyWitness: MerkleMapWitness,
  nftContractNFTAdminSignature: Signature,
}) {}

export function createSupplyNFTforMina(
  nftOrder: NFTforMina,
  swapContractKeyWitness: MerkleMapWitness,
  swapContractAdminSignature: Signature,
  nftKeyWitness: MerkleMapWitness,
  nftContractNFTAdminSignature: Signature
): SupplyNFTforMina {
  const supplyNFTforMina = new SupplyNFTforMina({
    nftOrder: nftOrder,
    swapContractKeyWitness: swapContractKeyWitness,
    swapContractAdminSignature: swapContractAdminSignature,
    nftKeyWitness: nftKeyWitness,
    nftContractNFTAdminSignature: nftContractNFTAdminSignature,
  });
  return supplyNFTforMina;
}

export function createSupplyNFTforNFT(
  nftOrder: NFTforNFT,
  swapContractKeyWitness: MerkleMapWitness,
  swapContractAdminSignature: Signature,
  nftKeyWitness: MerkleMapWitness,
  nftContractNFTAdminSignature: Signature
): SupplyNFTforNFT {
  const supplyNFTforNFT = new SupplyNFTforNFT({
    nftOrder: nftOrder,
    swapContractKeyWitness: swapContractKeyWitness,
    swapContractAdminSignature: swapContractAdminSignature,
    nftKeyWitness: nftKeyWitness,
    nftContractNFTAdminSignature: nftContractNFTAdminSignature,
  });
  return supplyNFTforNFT;
}
