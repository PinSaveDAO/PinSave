import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import { parseCid } from "livepeer/media";

import { getContractInfo } from "@/utils/contracts";
import { Post } from "@/services/upload";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    const { address, abi } = getContractInfo(250);

    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.ankr.com/fantom/"
    );

    const contract = new ethers.Contract(address, abi, provider);

    const result = await contract.getPost(id);
    const owner = await contract.getPostOwner(id);

    let x = result.replace("ipfs://", "https://");

    let resURL = x
      .split("/metadata.json")
      .join(".ipfs.nftstorage.link/metadata.json");

    const item: Post = await fetch(resURL).then((x) => x.json());

    let decoded_image;

    if (item.image) {
      if (item.image.charAt(0) === "i") {
        decoded_image = "https://ipfs.io/ipfs/" + parseCid(item.image)?.id;
      }
    }

    if (!decoded_image) {
      decoded_image = "https://evm.pinsave.app/PinSaveCard.png";
    }

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
