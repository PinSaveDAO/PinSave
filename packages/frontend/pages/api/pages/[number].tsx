import type { NextApiRequest, NextApiResponse } from "next";
import { getVercelMetadata, getAppString } from "pin-mina";
import { getVercelClient } from "@/services/vercelClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const host = process.env.NEXT_PUBLIC_ISDEV
      ? "http://localhost:3000"
      : "https://pinsave.app";
    const { number } = req.query;
    const pageNumber = Number(number);

    const client = await getVercelClient();
    const appId = getAppString();

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
