import { startBerkeleyClient, getAppString, getVercelNFT } from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";
import { getVercelClient } from "@/services/vercelClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    const idNumber = Number(id);

    startBerkeleyClient();

    const appId = getAppString();

    const client = await getVercelClient();
    const nft = await getVercelNFT(appId, idNumber, client);

    res.status(200).json({ ...nft });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
