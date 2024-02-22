import {
  startBerkeleyClient,
  getAppString,
  getMapFromVercelNfts,
  serializeMerkleMapToJson,
} from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";
import { kv, createClient } from "@vercel/kv";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    startBerkeleyClient();
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

    const appId = getAppString();
    const storedMap = await getMapFromVercelNfts(appId, [0, 1, 2], client);
    const dataOut = serializeMerkleMapToJson(storedMap);

    res.status(200).json({ dataOut });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
