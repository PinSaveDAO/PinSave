import { MerkleMapContract } from '../NFTsMapContract.js';

export function logStates(zkAppInstance: MerkleMapContract) {
  const treeRoot = zkAppInstance.treeRoot.get();

  console.log('treeRoot state: ', treeRoot.toString());
}
