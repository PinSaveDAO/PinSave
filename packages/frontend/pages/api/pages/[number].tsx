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
  res: NextApiResponse
) {
  try {
    const { number } = req.query;
    const pageNumber = Number(number);
    let index = 10;
    startBerkeleyClient();

    const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();

    const zkAppInstance: MerkleMapContract = new MerkleMapContract(
      zkAppAddress
    );

    const totalSupply = Number(await getTotalSupplyLive(zkAppInstance));

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
  } catch (err) {
    res.status(500).json({ error: "failed to fetch data" + err });
  }
}
