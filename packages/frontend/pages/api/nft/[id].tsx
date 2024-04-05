import type { NextApiRequest, NextApiResponse } from "next";
import type { VercelKV } from "@vercel/kv";
import { getAppString, getVercelNFT, NFTSerializedData } from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NFTSerializedData>
) {
  const { id } = req.query;
  const idNumber: number = Number(id);
  const appId: string = getAppString();
  const client: VercelKV = getVercelClient();
  const nft: NFTSerializedData = await getVercelNFT(appId, idNumber, client);
  res.status(200).json({ ...nft });
}
