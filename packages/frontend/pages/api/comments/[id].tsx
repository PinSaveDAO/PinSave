import { getAppString, getVercelPostComments } from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";

import { getVercelClient } from "@/services/vercelClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const postId = String(id);
  const appId = getAppString();
  const client = getVercelClient();
  const comments = await getVercelPostComments(appId, postId, client);
  res.status(200).json({ comments: comments });
}
