import { getContractInfo } from "../../../../utils/contracts";
import { ethers } from "ethers";

export default async function handler(req, res) {
  try {
    const { number } = req.query;
    const { address, abi } = getContractInfo(80001);

    let provider = new ethers.providers.AlchemyProvider(
      "maticmum",
      process.env.NEXT_ALCHEMY_ID
    );

    const contract = new ethers.Contract(address, abi, provider);
    const currentCount = Number(await contract.totalSupply());

    let items = [];
    let result;
    for (let i = currentCount; i >= number; i--) {
      result = await contract.tokenURI(i);

      let x = result
        .replace("ipfs://", "https://")
        .replace("sia://", "https://siasky.net/");

      let resURL = x.replace("/metadata.json", ".ipfs.dweb.link/metadata.json");
      try {
        // console.log(i);
        const item = await fetch(resURL).then((x) => x.json());

        items.push({ token_id: i, ...item });
      } catch (e) {
        console.log(e);
      }
    }

    res.status(200).json({ ...items });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
