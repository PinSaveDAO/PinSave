import { generateCollectionWithMap } from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";

import { PublicKey, Field } from "o1js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;

    const index = Number(id);

    const pubKey: PublicKey = PublicKey.fromBase58(
      "B62qqpPjKKgp8G2kuB82g9NEgfg85vmEAZ84to3FfyQeL4MuFm5Ybc9"
    );

    const { map: map, nftArray: nftArray } = generateCollectionWithMap(pubKey);

    const output = nftArray[index].nftMetadata;

    res.status(200).json({ ...output });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
