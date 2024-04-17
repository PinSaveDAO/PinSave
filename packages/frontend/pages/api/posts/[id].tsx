import type { VercelKV } from "@vercel/kv";
import type { NextApiRequest, NextApiResponse } from "next";
import { getVercelMetadata, getAppString, NFTSerializedData } from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NFTSerializedData>
) {
  const { id } = req.query;
  const index: number = Number(id);
  const client: VercelKV = getVercelClient();
  const appId: string = getAppString();
  const data: NFTSerializedData = await getVercelMetadata(appId, index, client);
  res.status(200).json({ ...data });
}
