import { fetchDecodedPost } from "@/services/fetchCid";
import { generateCollectionWithMap, nftMetadata } from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";
import { PublicKey } from "o1js";

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

    const item: nftMetadata = nftArray.nftMetadata[index];

    const decoded = await fetchDecodedPost(item.cid);

    const itemOut = {
      name: item.name,
      description: item.description,
      token_id: Number(item.id),
      image: decoded.image,
      owner: item.owner.toBase58(),
    };

    res.status(200).json({ ...itemOut });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
