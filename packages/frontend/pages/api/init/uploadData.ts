import type { NextApiRequest, NextApiResponse } from "next";
import {
  getAppString,
  setVercelNFT,
  setVercelMetadata,
  NFTMetadata,
  createNFT,
} from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const nftMetadata: NFTMetadata = req.body.nftMetadata;
    const client = getVercelClient();
    const appId = getAppString();
    const nftHashed = createNFT(nftMetadata);
    await setVercelNFT(appId, nftHashed, client);
    await setVercelMetadata(appId, nftMetadata, client);
    res.status(200);
  }
}
