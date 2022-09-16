import { getContractInfo } from "@/utils/contracts";
import { ethers } from "ethers";

export default async function handler(req, res) {
  try {
    const { number } = req.query;
    const { address, abi } = getContractInfo(22);

    let provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.l14.lukso.network"
    );

    const contract = new ethers.Contract(address, abi, provider);
    const currentCount = Number(await contract.totalSupply());
    console.log(currentCount);

    res.status(200).json(currentCount);
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
