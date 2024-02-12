import type { NextApiRequest, NextApiResponse } from "next";
import { kv, createClient } from "@vercel/kv";
import { getVercelMetadata, getAppPublic } from "pin-mina";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const isDev = process.env.NEXT_PUBLIC_ISDEV ?? "false";
    const host = process.env.NEXT_PUBLIC_ISDEV
      ? "http://localhost:3000"
      : "https://pinsave.app";

    let client = kv;
    if (isDev === "true") {
      const url = process.env.NEXT_PUBLIC_REDIS_URL;
      const token = process.env.NEXT_PUBLIC_REDIS_TOKEN;
      client = createClient({
        url: url,
        token: token,
      });
    }

    const { number } = req.query;
    const pageNumber = Number(number);

    const { appPubKey: zkAppAddress } = getAppPublic();

    const appId = zkAppAddress.toBase58();

    const response = await fetch(`${host}/api/totalInited`);
    const data = await response.json();

    const totalInited = data.totalInited;

    let items = [];

    const perPage = 6;
    var upperLimit = perPage * pageNumber;
    const lowerLimit = upperLimit - perPage;
    if (totalInited < upperLimit) {
      upperLimit = totalInited - 1;
    }

    try {
      for (let index = lowerLimit; upperLimit >= index; index++) {
        const data = await getVercelMetadata(appId, index, client);
        items.push({ ...data });
      }
    } catch (err) {
      res.status(200).json({
        items: items,
        totalInited: totalInited,
        error: "failed to fetch data" + err,
      });
    }
    res
      .status(200)
      .json({ items: items, totalSupply: totalInited, page: pageNumber });
  } catch (e) {
    res.status(500).json({ error: "failed to fetch data" + e });
  }
}
