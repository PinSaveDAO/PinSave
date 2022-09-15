import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

import { getContractInfo } from "@/utils/contracts";
import { Post } from "@/services/upload";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { number } = req.query;
    const { address, abi } = getContractInfo(80001);

    let provider = new ethers.providers.AlchemyProvider(
      "maticmum",
      process.env.NEXT_ALCHEMY_ID
    );

    const contract = new ethers.Contract(address, abi, provider);

    const result = await contract.tokenURI(number);
    const owner = await contract.ownerOf(number);

    let x = result
      .replace("ipfs://", "https://")
      .replace("sia://", "https://siasky.net/");

    let resURL = x.replace("/metadata.json", ".ipfs.dweb.link/metadata.json");

    const item: Post = await fetch(resURL).then((x) => x.json());

    let z, y;
    if (item._data) {
      if (typeof item._data?.image === "string") {
        y = String(item._data?.image).replace("sia://", "");
        z = "siasky.net/" + y;
      } else {
        z = "siasky.net/bABrwXB_uKp6AYEuBk_yxEfSMP7QFKfHQe9KB8AF2nTL2w";
      }
    }
    if (item.image) {
      if (item.image.charAt(0) === "i") {
        y = item.image.replace("ipfs://", "");
        z = y.replace("/", ".ipfs.dweb.link/");
        z = `https://${z}`;
      }
      if (item.image.charAt(0) === "s") {
        y = item.image?.replace("sia://", "");
        z = "siasky.net/" + y;
        z = `https://${z}`;
      }
    }

    const output = { ...item, owner: owner, image: z };

    res.status(200).json(output);
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
