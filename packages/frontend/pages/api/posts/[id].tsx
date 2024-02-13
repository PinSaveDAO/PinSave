import { getVercelMetadata, getAppString } from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";
import { kv, createClient } from "@vercel/kv";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
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
    const { id } = req.query;
    const index = Number(id);
    const appId = getAppString();

    const data = await getVercelMetadata(appId, index, client);

    res.status(200).json({ ...data });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
