import { PublicKey, PrivateKey, MerkleMap } from 'o1js';

import { compareLogStates, getTreeRoot } from '../AppState.js';
import { NFT } from '../NFT/NFT.js';
import { logTokenBalances } from '../TokenBalances.js';
import { mintNFTwithMap, initNFT } from '../transactions.js';
import { MerkleMapContract } from '../../NFTsMapContract.js';

export async function mintNFTWithMapAndLogs(
  zkAppPK: PrivateKey,
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
    // ensures that local map matches on-chain
    const match =
      merkleMap.getRoot().toString() ===
      (await getTreeRoot(zkAppInstance)).toString();
    console.log('it is a tree root state match', match);
  }

  await mintNFTwithMap(
    zkAppPK,
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
  zkAppPK: PrivateKey,
  pk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  compile: boolean = false,
  live: boolean = false,
  displayLogs: boolean = false
) {
  const pubKey: PublicKey = pk.toPublicKey();

  await initNFT(
    zkAppPK,
    pubKey,
    pk,
    _NFT,
    zkAppInstance,
    merkleMap,
    compile,
    live
  );

  if (displayLogs) {
    compareLogStates(zkAppInstance, merkleMap);
  }
}
