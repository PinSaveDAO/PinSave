import { Struct, MerkleMapWitness, Signature } from 'o1js';

import { NFTforMina, NFTforNFT } from './BidNFT';

export class NFTforMinaOrder extends Struct({
  nftOrder: NFTforMina,
  swapContractNFTOrderKeyWitness: MerkleMapWitness,
  swapContractNFTOrderAdminSignature: Signature,
  nftKeyWitness: MerkleMapWitness,
  nftContractNFTAdminSignature: Signature,
}) {}

export class NFTforNFTOrder extends Struct({
  nftOrder: NFTforNFT,
  swapContractNFTOrderKeyWitness: MerkleMapWitness,
  swapContractNFTOrderAdminSignature: Signature,
  nftKeyWitness: MerkleMapWitness,
  nftContractNFTAdminSignature: Signature,
}) {}

export function createNFTforMinaOrder(
  nftOrder: NFTforMina,
  swapContractNFTOrderKeyWitness: MerkleMapWitness,
  swapContractNFTOrderAdminSignature: Signature,
  nftKeyWitness: MerkleMapWitness,
  nftContractNFTAdminSignature: Signature
): NFTforMinaOrder {
  const nftforMinaOrder = new NFTforMinaOrder({
    nftOrder: nftOrder,
    swapContractNFTOrderKeyWitness: swapContractNFTOrderKeyWitness,
    swapContractNFTOrderAdminSignature: swapContractNFTOrderAdminSignature,
    nftKeyWitness: nftKeyWitness,
    nftContractNFTAdminSignature: nftContractNFTAdminSignature,
  });
  return nftforMinaOrder;
}

export function createNFTforNFTOrder(
  nftOrder: NFTforNFT,
  swapContractKeyWitness: MerkleMapWitness,
  swapContractAdminSignature: Signature,
  nftKeyWitness: MerkleMapWitness,
  nftContractNFTAdminSignature: Signature
): NFTforNFTOrder {
  const nftforNFTOrder = new NFTforNFTOrder({
    nftOrder: nftOrder,
    swapContractNFTOrderKeyWitness: swapContractKeyWitness,
    swapContractNFTOrderAdminSignature: swapContractAdminSignature,
    nftKeyWitness: nftKeyWitness,
    nftContractNFTAdminSignature: nftContractNFTAdminSignature,
  });
  return nftforNFTOrder;
}
