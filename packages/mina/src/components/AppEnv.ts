import { PublicKey } from 'o1js';

import { MerkleMapContract } from '../NFTsMapContract.js';

export function getAppDeployer() {
  const pubKeyString: string =
    'B62qqpPjKKgp8G2kuB82g9NEgfg85vmEAZ84to3FfyQeL4MuFm5Ybc9';
  const pubKey: PublicKey = PublicKey.fromBase58(pubKeyString);
  return pubKey;
}

export function getAppString() {
  const appPubString: string =
    'B62qqdFj5RJNk9ieNV9PDymu19Lqpe6jXUfpatAFoE4iHLo3137yMCE';
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
