import { Field, UInt64, fetchAccount } from 'o1js';

import { MerkleMapContract } from '../NFTsMapContract.js';

export async function getAppState(
  zkAppInstance: MerkleMapContract,
  live: boolean = true
) {
  if (live) {
    await fetchAccount({ publicKey: zkAppInstance.address });
  }
  const treeRoot: Field = zkAppInstance.root.get();
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
  const treeRoot: Field = zkAppInstance.root.get();
  return treeRoot;
}
