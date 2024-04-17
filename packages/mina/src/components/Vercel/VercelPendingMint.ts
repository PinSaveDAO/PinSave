import type { VercelKV } from '@vercel/kv';

import { MintAAAttemptData } from './VercelAAMint';

export type MintPendingAttemptData = MintAAAttemptData & {
  txId: string;
};

export async function getMintVercelPending(
  appId: string,
  nftId: number | string,
  attemptId: number | string,
  client: VercelKV
): Promise<MintPendingAttemptData> {
  const key: string = `${appId} mint pending ${nftId} ${attemptId}`;
  const data: MintPendingAttemptData | null = await client.hgetall(key);
  if (data) {
    return data;
  }
  throw Error('mint pending not fetched');
}

export async function mintVercelPending(
  appId: string,
  nftId: number | string,
  attemptId: number | string,
  txId: number | string,
  client: VercelKV
): Promise<number> {
  const key: string = `${appId} mint pending ${nftId} ${attemptId}`;
  const data: string | null = await client.hget(key, 'attemptId');
  if (data) {
    throw Error('mint pending already exists');
  }
  const res: number = await client.hset(key, {
    attemptId: attemptId,
    txId: txId,
  });
  return res;
}

export async function getMintVercelPendingAllKeys(
  appId: string,
  client: VercelKV
): Promise<string[]> {
  const key: string = `${appId} mint pending*`;
  const keys: string[] = await client.keys(key);
  return keys;
}
