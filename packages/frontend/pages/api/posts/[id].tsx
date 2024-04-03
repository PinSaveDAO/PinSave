import { getVercelMetadata, getAppString, nftDataIn } from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";

import { getVercelClient } from "@/services/vercelClient";
import { VercelKV } from "@vercel/kv";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<nftDataIn>
) {
  const { id } = req.query;
  const index: number = Number(id);
  const client: VercelKV = getVercelClient();
  const appId: string = getAppString();
  const data: nftDataIn = await getVercelMetadata(appId, index, client);
  res.status(200).json({ ...data });
}
