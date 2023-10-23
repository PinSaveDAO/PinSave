import { fetchDecodedPost } from "@/services/fetchCid";
import { getContractInfo } from "@/utils/contracts";
import { Contract, InfuraProvider } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    const { address, abi } = getContractInfo(10);

    const provider = new InfuraProvider(
      "optimism",
      process.env.NEXT_PUBLIC_INFURA_OPTIMISM
    );

    const contract = new Contract(address, abi, provider);

    const result = await contract.getPostCid(id);

    const output = await fetchDecodedPost(result);

    const owner = await contract.getPostOwner(id);

    res.status(200).json({ ...output, owner: owner });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
