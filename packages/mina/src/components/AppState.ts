import { MerkleMapContract } from '../NFTsMapContract.js';

import { MerkleMap } from 'o1js';

export function logStates(zkAppInstance: MerkleMapContract, map: MerkleMap) {
  const localMapRoot = map.getRoot().toString();

  logAppStates(zkAppInstance);

  console.log('compare to local map: ' + localMapRoot);
}

export function logAppStates(zkAppInstance: MerkleMapContract) {
  const treeRoot = zkAppInstance.treeRoot.get();
  const totalSupply = zkAppInstance.totalSupply.get();

  console.log('totalSupply state: ', totalSupply.toString());
  console.log('treeRoot state: ', treeRoot.toString());
}
