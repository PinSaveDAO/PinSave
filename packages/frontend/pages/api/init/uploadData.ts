import type { NextApiRequest, NextApiResponse } from "next";
import {
  getAppString,
  setVercelNFT,
  setVercelMetadata,
  NFTMetadata,
  createNFT,
  NFT,
} from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";
import { VercelKV } from "@vercel/kv";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const nftMetadata: NFTMetadata = req.body.nftMetadata;
    const client: VercelKV = getVercelClient();
    const appId: string = getAppString();
    const nftHashed: NFT = createNFT(nftMetadata);
    await setVercelNFT(appId, nftHashed, client);
    await setVercelMetadata(appId, nftMetadata, client);
    res.status(200);
  }
}
