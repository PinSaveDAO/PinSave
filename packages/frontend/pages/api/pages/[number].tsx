import { fetchDecodedPost } from "@/services/fetchCid";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  MerkleMapContract,
  startBerkeleyClient,
  getTotalSupplyLive,
  generateDummyNftMetadata,
  nftMetadata,
  getAppPublic,
} from "pin-mina";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { number } = req.query;
    const pageNumber = Number(number);

    console.log(pageNumber);

    startBerkeleyClient();

    const { pubKey: pubKey, appPubKey: zkAppAddress } = getAppPublic();

    const zkAppInstance: MerkleMapContract = new MerkleMapContract(
      zkAppAddress
    );

    const totalSupply = Number(await getTotalSupplyLive(zkAppInstance));

    console.log(totalSupply);
    let items = [];

    const perPage = 6;
    var upperLimit = perPage * pageNumber;

    const lowerLimit = upperLimit - perPage + 1;

    if (totalSupply < upperLimit) {
      upperLimit = totalSupply;
    }

    try {
      for (let i = lowerLimit; upperLimit >= i; i++) {
        const item: nftMetadata = generateDummyNftMetadata(i, pubKey);

        const decoded = await fetchDecodedPost(item.cid);

        const itemOut = {
          name: item.name,
          description: item.description,
          token_id: Number(item.id),
          image: decoded.image,
          owner: item.owner.toBase58(),
        };

        items.push({ ...itemOut });
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
