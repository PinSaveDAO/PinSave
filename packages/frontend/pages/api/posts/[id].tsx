import { getVercelMetadata } from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;

    const index = Number(id);

    const data = await getVercelMetadata(index, kv);

    res.status(200).json({ ...data });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
