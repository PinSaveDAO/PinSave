import {
  startBerkeleyClient,
  getTotalInitedLive,
  getAppContract,
} from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";

type DataOut = {
  totalInited: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DataOut>
) {
  startBerkeleyClient();
  const zkAppInstance = getAppContract();
  const totalInited: number = await getTotalInitedLive(zkAppInstance);
  res.status(200).json({ totalInited: totalInited });
}
