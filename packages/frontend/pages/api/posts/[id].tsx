import { getVercelMetadata, getAppString, nftDataIn } from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";

import { getVercelClient } from "@/services/vercelClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<nftDataIn>
) {
  const { id } = req.query;
  const index = Number(id);
  const client = getVercelClient();
  const appId = getAppString();
  const data = await getVercelMetadata(appId, index, client);
  res.status(200).json({ ...data });
}
