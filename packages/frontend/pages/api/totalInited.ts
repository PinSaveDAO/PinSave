import type { NextApiRequest, NextApiResponse } from "next";
import {
  startBerkeleyClient,
  getTotalInitedLive,
  getAppContract,
  NFTContract,
} from "pin-mina";

type DataOut = {
  totalInited: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DataOut>
) {
  startBerkeleyClient();
  const zkAppInstance: NFTContract = getAppContract();
  const totalInited: number = await getTotalInitedLive(zkAppInstance, true);
  res.status(200).json({ totalInited: totalInited });
}
