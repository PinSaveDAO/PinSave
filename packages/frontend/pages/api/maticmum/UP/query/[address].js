import LSP0ERC725Account from "@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json";
import { ethers } from "ethers";

export default async function handler(req, res) {
  try {
    const { address } = req.query;

    let provider = new ethers.providers.AlchemyProvider(
      "maticmum",
      process.env.NEXT_ALCHEMY_ID
    );

    const some = new ethers.Contract(
      address,
      LSP0ERC725Account.abi,
      new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY, provider)
    );

    const owner = await some.owner();

    res.status(200).json({ owner: owner });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
