import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

import { getContractInfo } from "@/utils/contracts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { number } = req.query;
    const pageNumber = Number(number) + 1;

    const { address, abi } = getContractInfo(80001);
    let provider = new ethers.providers.AlchemyProvider(
      "maticmum",
      process.env.NEXT_ALCHEMY_ID
    );

    const contract = new ethers.Contract(address, abi, provider);

    let items = [];
    let result;

    const upperLimit = 6 * pageNumber;
    const lowerLimit = upperLimit - 6 + 1;
    try {
      for (let i = lowerLimit; upperLimit > i; i++) {
        result = await contract.tokenURI(i);

        let x = result.replace("ipfs://", "https://");

        let resURL = x.replace(
          "/metadata.json",
          ".ipfs.dweb.link/metadata.json"
        );

        const item = await fetch(resURL).then((x) => x.json());

        items.push({ token_id: i, ...item });
      }
    } catch {
      res.status(200).json(items);
    }

    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch data" + err });
  }
}
