import type { VercelKV } from '@vercel/kv';

export type MintAAAttemptData = {
  attemptId: string | number;
};

export async function getMintVercelAA(
  appId: string,
  nftId: number | string,
  attemptId: number | string,
  client: VercelKV
): Promise<MintAAAttemptData> {
  const key: string = `${appId} mint AA ${nftId} ${attemptId}`;
  const data: MintAAAttemptData | null = await client.hgetall(key);
  if (data) {
    return data;
  }
  throw Error('mint AA not fetched');
}

export async function mintVercelAA(
  appId: string,
  nftId: string | number,
  attemptId: number | string,
  client: VercelKV
): Promise<number> {
  const key: string = `${appId} mint AA ${nftId} ${attemptId}`;
  const nftIdFetched: string | null = await client.hget(key, 'attemptId');
  if (nftIdFetched) {
    throw Error('mint AA already exists');
  }
  const res: number = await client.hset(key, {
    attemptId: attemptId,
  });
  return res;
}

export async function getMintVercelAAAllKeys(
  appId: string,
  client: VercelKV
): Promise<string[]> {
  const key: string = `${appId} mint AA*`;
  const keys: string[] = await client.keys(key);
  return keys;
}
