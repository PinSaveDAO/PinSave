import { fetchDecodedPost } from "@/services/fetchCid";
import { getContractInfo } from "@/utils/contracts";
import {
  AlchemyProvider,
  Contract,
  JsonRpcProvider,
  getDefaultProvider,
} from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    const { address, abi } = getContractInfo(5);
    const provider = new JsonRpcProvider(
      "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      "goerli"
    );
    //getDefaultProvider("goerli");

    const contract = new Contract(address, abi, provider);

    const result = await contract.getPostCid(id);

    console.log(result);

    /*     

    const owner = await contract.getPostOwner(id);

    console.log("CID:" + result);

    const output = await fetchDecodedPost(result);

    res.status(200).json({ ...output, owner: owner }); */
    res.status(200).json({ id, address, result });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
