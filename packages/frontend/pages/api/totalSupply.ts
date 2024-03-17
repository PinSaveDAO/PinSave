import {
  startBerkeleyClient,
  getAppContract,
  getTotalSupplyLive,
} from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";

type DataOut = {
  totalSupply: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DataOut>
) {
  startBerkeleyClient();
  const zkAppInstance = getAppContract();
  const totalSupply = await getTotalSupplyLive(zkAppInstance);
  res.status(200).json({ totalSupply: totalSupply });
}
