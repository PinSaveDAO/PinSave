import { getVercelMetadata, getAppString } from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";

import { getVercelClient } from "@/services/vercelClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    const index = Number(id);

    const client = await getVercelClient();
    const appId = getAppString();

    const data = await getVercelMetadata(appId, index, client);

    res.status(200).json({ ...data });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
