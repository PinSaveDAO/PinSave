import { Struct, MerkleMapWitness, Signature, Field } from 'o1js';

import { NFTforMina, NFTforNFT } from './BidNFT';

export class NFTforMinaOrder extends Struct({
  merkleMapId: Field,
  nftOrder: NFTforMina,
  swapContractNFTOrderKeyWitness: MerkleMapWitness,
  swapContractNFTOrderAdminSignature: Signature,
  nftContractKeyWitness: MerkleMapWitness,
  nftContractNFTAdminSignature: Signature,
}) {}

export class NFTforNFTOrder extends Struct({
  merkleMapId: Field,
  nftOrder: NFTforNFT,
  swapContractNFTOrderKeyWitness: MerkleMapWitness,
  swapContractNFTOrderAdminSignature: Signature,
  nftContractKeyWitness: MerkleMapWitness,
  nftContractNFTAdminSignature: Signature,
}) {}

export function createNFTforMinaOrder(
  merkleMapId: Field,
  nftOrder: NFTforMina,
  swapContractNFTOrderKeyWitness: MerkleMapWitness,
  swapContractNFTOrderAdminSignature: Signature,
  nftKeyWitness: MerkleMapWitness,
  nftContractNFTAdminSignature: Signature
): NFTforMinaOrder {
  const nftforMinaOrder = new NFTforMinaOrder({
    merkleMapId: merkleMapId,
    nftOrder: nftOrder,
    swapContractNFTOrderKeyWitness: swapContractNFTOrderKeyWitness,
    swapContractNFTOrderAdminSignature: swapContractNFTOrderAdminSignature,
    nftContractKeyWitness: nftKeyWitness,
    nftContractNFTAdminSignature: nftContractNFTAdminSignature,
  });
  return nftforMinaOrder;
}

export function createNFTforNFTOrder(
  merkleMapId: Field,
  nftOrder: NFTforNFT,
  swapContractKeyWitness: MerkleMapWitness,
  swapContractAdminSignature: Signature,
  nftKeyWitness: MerkleMapWitness,
  nftContractNFTAdminSignature: Signature
): NFTforNFTOrder {
  const nftforNFTOrder = new NFTforNFTOrder({
    merkleMapId: merkleMapId,
    nftOrder: nftOrder,
    swapContractNFTOrderKeyWitness: swapContractKeyWitness,
    swapContractNFTOrderAdminSignature: swapContractAdminSignature,
    nftContractKeyWitness: nftKeyWitness,
    nftContractNFTAdminSignature: nftContractNFTAdminSignature,
  });
  return nftforNFTOrder;
}
