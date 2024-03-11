import { PublicKey, PrivateKey, MerkleMap } from 'o1js';

import { compareLogStates, getTreeRoot } from '../AppState.js';
import { NFT } from '../NFT/NFT.js';
import { logTokenBalances } from '../TokenBalances.js';
import { mintNFTwithMap, initNFT } from '../transactions.js';
import { MerkleMapContract } from '../../NFTsMapContract.js';

export async function mintNFTWithMapAndLogs(
  adminPK: PrivateKey,
  pk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  compile: boolean = false,
  live: boolean = false,
  displayLogs: boolean = false
) {
  const pubKey: PublicKey = pk.toPublicKey();

  if (displayLogs) {
    const match =
      merkleMap.getRoot().toString() ===
      (await getTreeRoot(zkAppInstance)).toString();
    console.log('it is a tree root state match', match);
  }

  await mintNFTwithMap(
    adminPK,
    pk,
    _NFT,
    zkAppInstance,
    merkleMap,
    compile,
    live
  );

  if (displayLogs) {
    logTokenBalances(pubKey, zkAppInstance);
    compareLogStates(zkAppInstance, merkleMap);
  }
}

export async function initNFTWithLogs(
  adminPK: PrivateKey,
  pk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  compile: boolean = false,
  live: boolean = false,
  displayLogs: boolean = false
) {
  await initNFT(adminPK, pk, _NFT, zkAppInstance, merkleMap, compile, live);
  if (displayLogs) {
    compareLogStates(zkAppInstance, merkleMap);
  }
}
