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

  console.log('max supply', maxSupply.toBigInt());
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
  const totalInited: Field = zkAppInstance.totalInited.get();
  const maxSupply: Field = zkAppInstance.maxSupply.get();
  return {
    treeRoot: treeRoot,
    totalSupply: totalSupply,
    totalInited: totalInited,
    maxSupply: maxSupply,
  };
}

export async function getTotalInitedLive(
  zkAppInstance: MerkleMapContract
): Promise<number> {
  await fetchAccount({ publicKey: zkAppInstance.address });
  const totalSupplyField: Field = zkAppInstance.totalInited.get();
  const totalSupply: number = Number(totalSupplyField);
  return totalSupply;
}

export async function getTotalSupplyLive(
  zkAppInstance: MerkleMapContract
): Promise<number> {
  await fetchAccount({ publicKey: zkAppInstance.address });
  const totalSupply64: UInt64 = zkAppInstance.totalSupply.get();
  const totalSupply = Number(totalSupply64);
  return totalSupply;
}

export async function getTreeRoot(
  zkAppInstance: MerkleMapContract
): Promise<Field> {
  await fetchAccount({ publicKey: zkAppInstance.address });
  const treeRoot: Field = zkAppInstance.treeRoot.get();
  return treeRoot;
}
