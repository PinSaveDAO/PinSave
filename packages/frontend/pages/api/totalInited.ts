import type { NextApiRequest, NextApiResponse } from "next";
import type { VercelKV } from "@vercel/kv";
import {
  startBerkeleyClient,
  getTotalInitedLive,
  getAppContract,
  NFTContract,
  validateTreeInited,
} from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";

type DataOut = {
  totalInited: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DataOut>
) {
  startBerkeleyClient();
  const client: VercelKV = getVercelClient();
  await validateTreeInited(client);

  const zkAppInstance: NFTContract = getAppContract();
  const totalInited: number = await getTotalInitedLive(zkAppInstance, true);

  res.status(200).json({ totalInited: totalInited });
}
