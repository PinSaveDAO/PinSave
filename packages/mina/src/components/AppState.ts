import { MerkleMapContract } from '../NFTsMapContract.js';

import { MerkleMap } from 'o1js';

export function logStates(zkAppInstance: MerkleMapContract, map: MerkleMap) {
  const treeRoot = zkAppInstance.treeRoot.get();
  const totalSupply = zkAppInstance.totalSupply.get();

  const localMapRoot = map.getRoot().toString();

  console.log('treeRoot state: ', treeRoot.toString());
  console.log('compare to local map: ' + localMapRoot);
  console.log('totalSupply state: ', totalSupply.toString());
}
