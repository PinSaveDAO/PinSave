import { Struct, MerkleMapWitness, Signature } from 'o1js';

import { NFTforMina, NFTforNFT } from './BidNFT';

export class SupplyNFTforMina extends Struct({
  item: NFTforMina,
  swapContractKeyWitness: MerkleMapWitness,
  swapContractAdminSignature: Signature,
  nftKeyWitness: MerkleMapWitness,
  nftContractAdminSignature: Signature,
}) {}

export class SupplyNFTforNFT extends Struct({
  item: NFTforNFT,
  swapContractKeyWitness: MerkleMapWitness,
  swapContractAdminSignature: Signature,
  nftKeyWitness: MerkleMapWitness,
  nftContractAdminSignature: Signature,
}) {}
