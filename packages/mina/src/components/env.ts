import dotenv from 'dotenv';
import { PublicKey, PrivateKey } from 'o1js';
import { createClient } from '@vercel/kv';
dotenv.config();

export function getEnvAccount() {
  const pk: PrivateKey = PrivateKey.fromBase58(
    process.env.deployerKey as string
  );
  const pubKey: PublicKey = pk.toPublicKey();
  return { pubKey: pubKey, pk: pk };
}

export function getVercelClient() {
  const client = createClient({
    url: process.env.KV_REST_API_URL as string,
    token: process.env.KV_REST_API_TOKEN as string,
  });
  return client;
}
