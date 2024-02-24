import { startBerkeleyClient, getAppString, getVercelNFT } from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";
import { kv, createClient } from "@vercel/kv";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    const idNumber = Number(id);
    startBerkeleyClient();
    const appId = getAppString();
    const isDev = process.env.NEXT_PUBLIC_ISDEV ?? "false";
    let client = kv;
    if (isDev === "true") {
      const url = process.env.NEXT_PUBLIC_REDIS_URL;
      const token = process.env.NEXT_PUBLIC_REDIS_TOKEN;
      client = createClient({
        url: url,
        token: token,
      });
    }

    const nft = await getVercelNFT(appId, idNumber, client);

    res.status(200).json({ ...nft });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
