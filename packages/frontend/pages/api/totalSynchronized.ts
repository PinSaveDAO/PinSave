import type { NextApiRequest, NextApiResponse } from "next";
import type { VercelKV } from "@vercel/kv";

import { getVercelClient } from "@/services/vercelClient";

type DataOut = {
  totalInited: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DataOut>
) {
  const client: VercelKV = getVercelClient();
  res.status(200).json({ totalInited: 69 });
}
