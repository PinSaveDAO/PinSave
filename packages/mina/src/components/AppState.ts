import { Field, MerkleMap, UInt64, PublicKey, fetchAccount } from 'o1js';

import { MerkleMapContract } from '../NFTsMapContract.js';

async function logAppStates(
  zkAppInstance: MerkleMapContract,
  live: boolean = true
) {
  const {
    treeRoot: treeRoot,
    totalSupply: totalSupply,
    totalInited: totalInited,
    maxSupply: maxSupply,
  } = await getAppState(zkAppInstance, live);

  console.log('max supply', maxSupply);
  console.log('totalSupply state:', totalSupply.toBigInt());
  console.log('totalInited state:', totalInited.toBigInt());
  console.log('treeRoot state:', treeRoot.toString());
}

export async function compareLogStates(
  zkAppInstance: MerkleMapContract,
  map: MerkleMap,
  live: boolean = true
) {
  const localMapRoot: string = map.getRoot().toString();
  await logAppStates(zkAppInstance, live);
  console.log('compare to local map:', localMapRoot);
}

export async function logAppStatesContract(
  zkAppAddress: PublicKey,
  live: boolean = true
) {
  const zkAppInstance: MerkleMapContract = new MerkleMapContract(zkAppAddress);
  await logAppStates(zkAppInstance, live);
}

export async function getAppState(
  zkAppInstance: MerkleMapContract,
  live: boolean = true
) {
  if (live) {
    await fetchAccount({ publicKey: zkAppInstance.address });
  }
  const treeRoot: Field = zkAppInstance.treeRoot.get();
  const totalSupply: UInt64 = zkAppInstance.totalSupply.get();
  const totalInited: UInt64 = zkAppInstance.totalInited.get();
  const maxSupply: bigint = zkAppInstance.maxSupply.toBigInt();
  return {
    treeRoot: treeRoot,
    totalSupply: totalSupply,
    totalInited: totalInited,
    maxSupply: maxSupply,
  };
}

export async function getTotalInitedLive(
  zkAppInstance: MerkleMapContract
): Promise<UInt64> {
  await fetchAccount({ publicKey: zkAppInstance.address });
  const totalSupply: UInt64 = zkAppInstance.totalInited.get();
  return totalSupply;
}

export async function getTotalSupplyLive(
  zkAppInstance: MerkleMapContract
): Promise<UInt64> {
  await fetchAccount({ publicKey: zkAppInstance.address });
  const totalSupply: UInt64 = zkAppInstance.totalSupply.get();
  return totalSupply;
}
