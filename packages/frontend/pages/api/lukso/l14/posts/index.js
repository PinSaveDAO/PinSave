import { getContractInfo } from "@/utils/contracts";
import { ethers } from "ethers";

export default async function handler(request, response) {
  try {
    //const { number } = req.query;
    const { address, abi } = getContractInfo(22);

    let provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.l14.lukso.network"
    );

    const contract = new ethers.Contract(address, abi, provider);
    const currentCount = Number(await contract.totalSupply());

    let items = [];
    let res;
    for (let i = currentCount; i >= currentCount && i > 0; i--) {
      res = await contract.getPost(i);

      let x = res
        .replace("ipfs://", "https://")
        .replace("sia://", "https://siasky.net/");

      let resURL = x.replace("/metadata.json", ".ipfs.dweb.link/metadata.json");

      const item = await fetch(resURL).then((x) => x.json());

      items.push({ token_id: i, ...item });
    }

    response.status(200).json(items);
  } catch (err) {
    response.status(500).send({ error: "failed to fetch data" + err });
  }
}
