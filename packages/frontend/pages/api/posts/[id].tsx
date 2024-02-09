import { getVercelMetadata, getAppPublic } from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";
import { kv, createClient } from "@vercel/kv";
import { fetchImage } from "@/services/fetchCid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;

    const index = Number(id);

    const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();

    const appId = zkAppAddress.toBase58();

    var data = await getVercelMetadata(appId, index, kv);

    //data.cid = await fetchImage(data.cid);

    res.status(200).json({ ...data });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
