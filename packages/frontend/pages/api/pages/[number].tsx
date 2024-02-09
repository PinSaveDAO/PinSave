import { fetchImage } from "@/services/fetchCid";
import type { NextApiRequest, NextApiResponse } from "next";
import { kv, createClient } from "@vercel/kv";
import {
  MerkleMapContract,
  startBerkeleyClient,
  getTotalSupplyLive,
  getVercelMetadata,
  getAppPublic,
} from "pin-mina";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    let index = 10;

    const isDev = process.env.NEXT_PUBLIC_ISDEV;

    const { number } = req.query;
    const pageNumber = Number(number);

    startBerkeleyClient();

    const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();

    const zkAppInstance: MerkleMapContract = new MerkleMapContract(
      zkAppAddress,
    );

    let totalSupply = 0;

    try {
      totalSupply = Number(await getTotalSupplyLive(zkAppInstance));
    } catch (e) {
      console.log(e);
    }

    let items = [];

    const perPage = 6;
    var upperLimit = perPage * pageNumber;
    const lowerLimit = upperLimit - perPage + 1;
    if (totalSupply < upperLimit) {
      upperLimit = totalSupply;
    }

    try {
      for (let i = lowerLimit; upperLimit >= i; i++) {
        const data = await getVercelMetadata(index, kv);

        data.cid = await fetchImage(data.cid);

        items.push({ ...data });
        index++;
      }
    } catch (err) {
      res.status(200).json({
        items: items,
        totalSupply: totalSupply,
        error: "failed to fetch data" + err,
      });
    }
    res
      .status(200)
      .json({ items: items, totalSupply: totalSupply, page: pageNumber });
  } catch (e) {
    res.status(500).json({ error: "failed to fetch data" + e });
  }
}
