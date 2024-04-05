import type { NextApiRequest, NextApiResponse } from "next";
import type { VercelKV } from "@vercel/kv";
import {
  getAppString,
  mintVercelNFTPending,
  mintVercelMetadataPending,
} from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";

type dataOut = {
  response: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<dataOut>
) {
  if (req.method === "POST") {
    const data = req.body;
    const postNumber: string = String(data.postNumber);
    const txId: string = String(data.txId);
    const attemptId: string = String(data.attemptId);
    const appId: string = getAppString();
    const client: VercelKV = getVercelClient();
    await mintVercelNFTPending(appId, postNumber, attemptId, txId, client);
    await mintVercelMetadataPending(appId, postNumber, attemptId, txId, client);
    res.status(200).json({ response: true });
  }
}
