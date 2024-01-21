import { fetchDecodedPost } from "@/services/fetchCid";
import { Contract, InfuraProvider } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;

    /*     const result = await contract.getPostCid(id);

    const output = await fetchDecodedPost(result);

    const owner = await contract.getPostOwner(id);

    res.status(200).json({ ...output, owner: owner }); */
    res.status(200).json({});
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
