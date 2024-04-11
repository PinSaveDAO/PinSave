import type { VercelKV } from '@vercel/kv';

export async function mintVercelMetadata(
  appId: string,
  nftId: string | number,
  client: VercelKV
): Promise<number> {
  const key: string = `${appId} metadata: ${nftId}`;
  const nftMetadataIdFetched: string | null = await client.hget(key, 'id');
  if (nftMetadataIdFetched) {
    throw Error('mint metadata already exists');
  }
  const res: number = await client.hset(key, { isMinted: '1' });
  return res;
}

export async function mintVercelNFT(
  appId: string,
  nftId: string | number,
  client: VercelKV
): Promise<number> {
  const key: string = `${appId} nft: ${nftId}`;
  const nftIdFetched: string | null = await client.hget(key, 'id');
  if (nftIdFetched) {
    throw Error('mint nft already exists');
  }
  const res: number = await client.hset(key, { isMinted: '1' });
  return res;
}
