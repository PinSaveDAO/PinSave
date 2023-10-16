import { parseCidIpfsio, parseCidDweb } from "@/services/parseCid";
import { getContractInfo } from "@/utils/contracts";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

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
    let resURL, resURL2;

    if (result) {
      if (result.charAt(0) === "i") {
        resURL = parseCidIpfsio(result);
        resURL2 = parseCidDweb(result);
      }

      if (result.charAt(0) === "h") {
        resURL = result;
        resURL2 = result;
      }
    }

    let item;

    try {
      item = await fetch(resURL).then((x) => x.json());
    } catch {
      item = await fetch(resURL2).then((x) => x.json());
    }

    let decoded_image;

    if (item.image) {
      if (item.image.charAt(0) === "i") {
        try {
          decoded_image = parseCidIpfsio(item.image);
          await fetch(decoded_image);
        } catch {
          decoded_image = parseCidDweb(item.image);
          await fetch(decoded_image);
        }
      }
      if (item.image.charAt(0) === "h") {
        decoded_image = item.image;
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
