import { fetchImage, fetchMetadata } from "@/services/fetchCid";
import { getContractInfo } from "@/utils/contracts";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    const { address, abi } = getContractInfo(80001);

    let provider = new ethers.providers.AlchemyProvider(
      "maticmum",
      process.env.NEXT_ALCHEMY_ID
    );

    const contract = new ethers.Contract(address, abi, provider);

    const result = await contract.tokenURI(id);
    const owner = await contract.ownerOf(id);

    const item = await fetchMetadata(result);

    const decoded_image = await fetchImage(item.image);

    const output = {
      ...item,
      owner: owner,
      image: decoded_image,
    };

    res.status(200).json(output);
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
