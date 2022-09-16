import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import { getContractInfo } from "@/utils/contracts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    //const { number } = req.query;
    const { address, abi } = getContractInfo(22);

    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.l14.lukso.network"
    );

    const contract = new ethers.Contract(address, abi, provider);
    const currentCount = Number(await contract.totalSupply());

    let items = [];
    let result;
    for (let i = currentCount; i >= currentCount && i > 0; i--) {
      result = await contract.getPost(i);

      let x = result
        .replace("ipfs://", "https://")
        .replace("sia://", "https://siasky.net/");

      let resURL = x.replace("/metadata.json", ".ipfs.dweb.link/metadata.json");

      const item = await fetch(resURL).then((x) => x.json());

      items.push({ token_id: i, ...item });
    }

    res.status(200).json(items);
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
