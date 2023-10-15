import { parseCidDweb, parseCidIpfsio } from "@/services/parseCid";
import { getContractInfo } from "@/utils/contracts";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { number } = req.query;
    const pageNumber = Number(number) + 1;

    const { address, abi } = getContractInfo(250);
    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.ankr.com/fantom/"
    );

    const contract = new ethers.Contract(address, abi, provider);

    const totalSupply = ethers.BigNumber.from(
      await contract.totalSupply()
    ).toNumber();

    let items = [];
    let result;

    var upperLimit = 6 * pageNumber;

    const lowerLimit = upperLimit - 6 + 1;

    if (totalSupply < upperLimit) {
      upperLimit = totalSupply;
    }

    try {
      for (let i = lowerLimit; upperLimit >= i; i++) {
        result = await contract.getPost(i);
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
        items.push({ token_id: i, ...item });
      }
    } catch {
      res
        .status(200)
        .json({ items: items, totalSupply: totalSupply, error: "true" });
    }

    res
      .status(200)
      .json({ items: items, totalSupply: totalSupply, error: "false" });
  } catch (err) {
    res.status(500).json({ error: "failed to fetch data" + err });
  }
}
