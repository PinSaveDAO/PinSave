import type { NextApiRequest, NextApiResponse } from "next";
import { getContractInfo } from "@/utils/contracts";
import { ethers } from "ethers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { address, abi } = getContractInfo(9000);

    const provider = new ethers.providers.JsonRpcProvider(
      "https://eth.bd.evmos.dev:8545"
    );

    const contract = new ethers.Contract(address, abi, provider);
    const currentCount = Number(await contract.totalSupply());

    let items = [];
    let result;
    for (let i = currentCount; i > 0; i--) {
      result = await contract.tokenURI(i);

      let x = result.replace("ipfs://", "https://");

      let resURL = x.replace(
        "/metadata.json",
        ".ipfs.nftstorage.link/metadata.json"
      );

      const item = await fetch(resURL).then((x) => x.json());

      items.push({ token_id: i, ...item });
    }

    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch data" + err });
  }
}
