import { fetchDecodedPost } from "@/services/fetchCid";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  MerkleMapContract,
  startBerkeleyClient,
  getTotalSupplyLive,
} from "pin-mina";
import { PublicKey, fetchAccount, UInt64, Field } from "o1js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { number } = req.query;
    const pageNumber = Number(number);
    startBerkeleyClient();
    const pubKey: PublicKey = PublicKey.fromBase58(
      "B62qkWDJWuPz1aLzwcNNCiEZNFnveQa2DEstF7vtiVJBTbkzi7nhGLm"
    );
    const zkAppInstance: MerkleMapContract = new MerkleMapContract(pubKey);

    const totalSupply = await getTotalSupplyLive(zkAppInstance);

    /*     let items = [];
    let result;

    var upperLimit = 6 * pageNumber;

    const lowerLimit = upperLimit - 6 + 1;

    if (totalSupply < upperLimit) {
      upperLimit = totalSupply;
    }
 */
    /*     try {
      for (let i = lowerLimit; upperLimit >= i; i++) {
        result = await contract.getPostCid(i);

        const item = await fetchDecodedPost(result);

        items.push({ token_id: i, ...item });
      }
    } catch {
      res.status(200).json({ items: items, totalSupply: totalSupply });
    } */

    //res.status(200).json({ items: items, totalSupply: totalSupply });
    res.status(200).json({ totalSupply: totalSupply });
  } catch (err) {
    res.status(500).json({ error: "failed to fetch data" + err });
  }
}
