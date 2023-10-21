import { fetchDecodedPost } from "@/services/fetchCid";
import { getContractInfo } from "@/utils/contracts";
import { AlchemyProvider, Contract } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { number } = req.query;
    const pageNumber = Number(number) + 1;

    const { address, abi } = getContractInfo(5);
    console.log("address:" + address);
    let provider = new AlchemyProvider(
      "goerli",
      process.env.NEXT_PUBLIC_ALCHEMY_ID
    );

    const contract = new Contract(address, abi, provider);

    const totalSupply = Number(await contract.totalSupply());

    console.log("address:" + address);

    let items = [];
    let result;

    var upperLimit = 6 * pageNumber;

    const lowerLimit = upperLimit - 6 + 1;

    if (totalSupply < upperLimit) {
      upperLimit = totalSupply;
    }

    try {
      for (let i = lowerLimit; upperLimit >= i; i++) {
        result = await contract.getPostCid(i);

        const item = await fetchDecodedPost(result);

        items.push({ token_id: i, ...item });
      }
    } catch {
      res.status(200).json({ items: items, totalSupply: totalSupply });
    }

    res.status(200).json({ items: items, totalSupply: totalSupply });
  } catch (err) {
    res.status(500).json({ error: "failed to fetch data" + err });
  }
}
