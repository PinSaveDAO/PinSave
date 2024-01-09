import { MerkleMapContract } from '../NFTsMapContract.js';

import { Field, MerkleMap, UInt64 } from 'o1js';

export function logStates(zkAppInstance: MerkleMapContract, map: MerkleMap) {
  const localMapRoot: string = map.getRoot().toString();

  logAppStates(zkAppInstance);

  console.log('compare to local map: ' + localMapRoot);
}

export function logAppStates(zkAppInstance: MerkleMapContract) {
  const treeRoot: Field = zkAppInstance.treeRoot.get();
  const totalSupply: UInt64 = zkAppInstance.totalSupply.get();

  console.log('totalSupply state: ', totalSupply.toString());
  console.log('treeRoot state: ', treeRoot.toString());
}
