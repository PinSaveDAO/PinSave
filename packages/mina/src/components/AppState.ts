import { Field, MerkleMap, UInt64, PublicKey, fetchAccount } from 'o1js';

import { MerkleMapContract } from '../NFTsMapContract.js';

function logAppStates(zkAppInstance: MerkleMapContract) {
  const treeRoot: Field = zkAppInstance.treeRoot.get();
  const totalSupply: UInt64 = zkAppInstance.totalSupply.get();
  const totalInited: UInt64 = zkAppInstance.totalInited.get();
  const maxSupply: bigint = zkAppInstance.maxSupply.toBigInt();
  console.log('max supply', maxSupply);

  console.log('totalSupply state:', totalSupply.toBigInt());
  console.log('totalInited state:', totalInited.toBigInt());
  console.log('treeRoot state:', treeRoot.toString());
}

export function logStates(zkAppInstance: MerkleMapContract, map: MerkleMap) {
  const localMapRoot: string = map.getRoot().toString();
  logAppStates(zkAppInstance);
  console.log('compare to local map:', localMapRoot);
}

export async function logAppStatesContract(
  zkAppAddress: PublicKey,
  live: boolean = true
) {
  const zkAppInstance: MerkleMapContract = new MerkleMapContract(zkAppAddress);
  if (live) {
    await fetchAccount({ publicKey: zkAppAddress });
  }
  logAppStates(zkAppInstance);
}

export async function getTotalSupplyLive(
  zkAppInstance: MerkleMapContract
): Promise<UInt64> {
  await fetchAccount({ publicKey: zkAppInstance.address });
  const totalSupply: UInt64 = zkAppInstance.totalSupply.get();
  return totalSupply;
}
