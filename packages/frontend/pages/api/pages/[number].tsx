import { fetchImage } from "@/services/fetchCid";
import type { NextApiRequest, NextApiResponse } from "next";
import { kv, createClient } from "@vercel/kv";
import {
  MerkleMapContract,
  startBerkeleyClient,
  getTotalInitedLive,
  getVercelMetadata,
  getAppPublic,
} from "pin-mina";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const isDev = process.env.NEXT_PUBLIC_ISDEV;
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

    startBerkeleyClient();

    const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();

    const appId = zkAppAddress.toBase58();

    const zkAppInstance: MerkleMapContract = new MerkleMapContract(
      zkAppAddress
    );

    let totalSupply = 0;

    try {
      totalSupply = Number(await getTotalInitedLive(zkAppInstance));
    } catch (e) {
      console.log(e);
    }

    let items = [];

    const perPage = 6;
    var upperLimit = perPage * pageNumber;
    const lowerLimit = upperLimit - perPage;
    if (totalSupply < upperLimit) {
      upperLimit = totalSupply;
    }

    try {
      for (let index = lowerLimit; upperLimit >= index; index++) {
        console.log(await getVercelMetadata(appId, 0, client));

        const data = await getVercelMetadata(appId, index, client);

        console.log(data);
        //data.cid = await fetchImage(data.cid);

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
  } catch (e) {
    res.status(500).json({ error: "failed to fetch data" + e });
  }
}
