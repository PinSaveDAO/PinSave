import {
  startBerkeleyClient,
  getAppContract,
  getTotalSupplyLive,
} from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    startBerkeleyClient();
    const zkAppInstance = getAppContract();
    const totalSupply = await getTotalSupplyLive(zkAppInstance);
    res.status(200).json({ totalSupply: totalSupply });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
