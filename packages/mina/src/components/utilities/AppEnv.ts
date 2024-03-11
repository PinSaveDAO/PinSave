import { PublicKey } from 'o1js';

import { MerkleMapContract } from '../../NFTsMapContract.js';

export function getAppString() {
  const appPubString: string =
    'B62qr3YP4gRiCEoWu8w65rProdsBaV7NeEU2sFgbgo8R4iHiVym5D6Q';
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
