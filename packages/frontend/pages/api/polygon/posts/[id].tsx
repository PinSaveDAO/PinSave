import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

import { getContractInfo } from "@/utils/contracts";
import { Post } from "@/services/upload";

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

    let x = result
      .replace("ipfs://", "https://")
      .replace("sia://", "https://siasky.net/");

    let resURL = x
      .split("/metadata.json")
      .join(".ipfs.dweb.link/metadata.json");

    const item: Post = await fetch(resURL).then((x) => x.json());

    let z, y;

    if (item.image) {
      if (item.image.charAt(0) === "i") {
        y = item.image.replace("ipfs://", "");
        z = y.replace("/", ".ipfs.dweb.link/");
        z = `https://${z}`;
      }
      if (item.image.charAt(0) === "s") {
        z = item.image.split("sia://").join("https://siasky.net/");
      }
    }

    if (!z) {
      z = "https://siasky.net/bABrwXB_uKp6AYEuBk_yxEfSMP7QFKfHQe9KB8AF2nTL2w";
    }
    const output = { ...item, owner: owner, image: z };

    res.status(200).json(output);
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
