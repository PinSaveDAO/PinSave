import type { NextApiRequest, NextApiResponse } from "next";
import type { VercelKV } from "@vercel/kv";
import { CommentData, getAppString, getVercelPostComments } from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";

type DataOut = {
  comments: CommentData[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DataOut>
) {
  const { id } = req.query;
  const postId: string = String(id);
  const appId: string = getAppString();
  const client: VercelKV = getVercelClient();
  const comments: CommentData[] = await getVercelPostComments(
    appId,
    postId,
    client
  );
  res.status(200).json({ comments: comments });
}
