import type { VercelKV } from '@vercel/kv';

export type CommentData = {
  publicKey: string;
  data: string;
  postId: string | number;
};

export async function getVercelComment(
  appId: string,
  postId: string | number,
  commentId: string | number,
  client: VercelKV
): Promise<CommentData> {
  const key: string = `${appId} ${postId} comment ${commentId} `;
  const comment: CommentData | null = await client.hgetall(key);
  if (comment) {
    return comment;
  }
  throw Error('comment not fetched');
}

export async function setVercelComment(
  appId: string,
  post: CommentData,
  client: VercelKV
): Promise<number> {
  const postId: string | number = post.postId;
  const commentId: number = await getVercelCommentsPostLength(
    appId,
    postId,
    client
  );
  const key: string = `${appId} ${postId} comment ${commentId} `;
  const res: number = await client.hset(key, { ...post, key: commentId });
  return res;
}

export async function getVercelPostComments(
  appId: string,
  postId: string | number,
  client: VercelKV
): Promise<CommentData[]> {
  const commentId: number = await getVercelCommentsPostLength(
    appId,
    postId,
    client
  );
  let output: CommentData[] = [];
  for (let i = 0; i < commentId; i++) {
    output.push(await getVercelComment(appId, postId, i, client));
  }
  return output;
}

export async function getVercelCommentsPostLength(
  appId: string,
  postId: string | number,
  client: VercelKV
): Promise<number> {
  const key: string = `${appId} ${postId} comment*`;
  const keys: string[] = await client.keys(key);
  if (!keys) {
    throw new Error('no keys found');
  }
  return keys.length;
}
