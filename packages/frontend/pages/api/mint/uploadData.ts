import type { NextApiRequest, NextApiResponse } from "next";
import { getAppString, mintVercelNFT, mintVercelMetadata } from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const data = req.body;
    const appId = getAppString();
    const postNumber = String(data.postNumber);
    const client = getVercelClient();
    await mintVercelNFT(appId, postNumber, client);
    await mintVercelMetadata(appId, postNumber, client);
    res.status(200);
  }
}
