import { fetchImage } from "@/services/fetchCid";
import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";
import {
  MerkleMapContract,
  startBerkeleyClient,
  getTotalSupplyLive,
  getVercelMetadata,
  getAppPublic,
} from "pin-mina";

const index = 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { number } = req.query;
    const pageNumber = Number(number);

    startBerkeleyClient();

    const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();

    const zkAppInstance: MerkleMapContract = new MerkleMapContract(
      zkAppAddress
    );

    const totalSupply = Number(await getTotalSupplyLive(zkAppInstance));

    let items = [];

    const perPage = 6;
    var upperLimit = perPage * pageNumber;

    if (totalSupply < upperLimit) {
      upperLimit = totalSupply;
    }

    const lowerLimit = upperLimit - perPage + 1;

    try {
      for (let i = lowerLimit; upperLimit >= i; i++) {
        var data = await getVercelMetadata(index, kv);

        data.cid = await fetchImage(data.cid);

        items.push({ ...data });
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
