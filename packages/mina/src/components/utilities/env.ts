import { PublicKey, PrivateKey } from 'o1js';
import { VercelKV, createClient } from '@vercel/kv';
import dotenv from 'dotenv';
dotenv.config();

import { NFTContract } from '../../NFTsMapContract.js';

export function getEnvAccount(): {
  pubKey: PublicKey;
  adminPK: PrivateKey;
} {
  const adminPK: PrivateKey = PrivateKey.fromBase58(
    process.env.deployerKey as string
  );
  const pubKey: PublicKey = adminPK.toPublicKey();
  return { pubKey: pubKey, adminPK: adminPK };
}

export function getAppEnv(): {
  zkAppPK: PrivateKey;
  zkAppAddress: PublicKey;
  appId: string;
  zkApp: NFTContract;
} {
  const zkAppPK: PrivateKey = PrivateKey.fromBase58(
    process.env.zkAppPrivateKey as string
  );
  const zkAppAddress: PublicKey = zkAppPK.toPublicKey();
  const appId: string = zkAppAddress.toBase58();
  const zkApp: NFTContract = new NFTContract(zkAppAddress);
  return {
    zkAppPK: zkAppPK,
    zkAppAddress: zkAppAddress,
    appId: appId,
    zkApp: zkApp,
  };
}

export function getVercelClient(): VercelKV {
  const client = createClient({
    url: process.env.KV_REST_API_URL as string,
    token: process.env.KV_REST_API_TOKEN as string,
  });
  return client;
}
