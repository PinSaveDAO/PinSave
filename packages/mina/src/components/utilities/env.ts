import { PublicKey, PrivateKey } from 'o1js';
import { createClient } from '@vercel/kv';
import dotenv from 'dotenv';
dotenv.config();

import { MerkleMapContract } from '../../NFTsMapContract.js';

export function getEnvAccount() {
  const adminPK: PrivateKey = PrivateKey.fromBase58(
    process.env.deployerKey as string
  );
  const pubKey: PublicKey = adminPK.toPublicKey();
  return { pubKey: pubKey, adminPK: adminPK };
}

export function getAppEnv() {
  const zkAppPK: PrivateKey = PrivateKey.fromBase58(
    process.env.zkAppPrivateKey as string
  );
  const zkAppAddress: PublicKey = zkAppPK.toPublicKey();
  const appId: string = zkAppAddress.toBase58();
  const zkApp: MerkleMapContract = new MerkleMapContract(zkAppAddress);
  return {
    zkAppPK: zkAppPK,
    zkAppAddress: zkAppAddress,
    appId: appId,
    zkApp: zkApp,
  };
}

export function getVercelClient() {
  const client = createClient({
    url: process.env.KV_REST_API_URL as string,
    token: process.env.KV_REST_API_TOKEN as string,
  });
  return client;
}
