import { PublicKey } from 'o1js';

import { MerkleMapContract } from '../../NFTsMapContract.js';

export function getAppString() {
  const appPubString: string =
    'B62qjHeCXnQMZtWz27UbKu6KHFmn6AKga51TqKR8ERAcfF9vnHB7KQC';
  return appPubString;
}

export function getAppPublic() {
  const appPubString = getAppString();
  const appPubKey: PublicKey = PublicKey.fromBase58(appPubString);
  return appPubKey;
}

export function getAppContract() {
  const zkAppAddress = getAppPublic();
  const zkApp: MerkleMapContract = new MerkleMapContract(zkAppAddress);
  return zkApp;
}
