import {
  startBerkeleyClient,
  getTotalInitedLive,
  getAppContract,
} from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    startBerkeleyClient();
    const zkAppInstance = getAppContract();
    let totalInited = 0;

    try {
      totalInited = Number(await getTotalInitedLive(zkAppInstance));
    } catch (e) {
      console.log(e);
    }

    res.status(200).json({ totalInited: totalInited });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
