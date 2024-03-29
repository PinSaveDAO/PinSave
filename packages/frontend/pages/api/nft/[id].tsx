import { getAppString, getVercelNFT, nftDataIn } from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";

import { getVercelClient } from "@/services/vercelClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<nftDataIn>
) {
  const { id } = req.query;
  const idNumber = Number(id);
  const appId = getAppString();
  const client = getVercelClient();
  const nft = await getVercelNFT(appId, idNumber, client);
  res.status(200).json({ ...nft });
}
