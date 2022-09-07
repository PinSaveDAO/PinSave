import Web3 from "web3";
import LSP3UniversalProfileMetadata from "@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json";
import { ERC725 } from "@erc725/erc725.js";

export default async function handler(req, res) {
  try {
    const { address } = req.query;

    const provider = new Web3.providers.HttpProvider(
      "https://rpc.l14.lukso.network"
    );

    const config = {
      ipfsGateway: "https://2eff.lukso.dev/ipfs/",
    };

    const erc725 = new ERC725(
      LSP3UniversalProfileMetadata,
      address,
      provider,
      config
    );
    const profileData = await erc725.fetchData();
    res.status(200).json({ ProfileData: profileData });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" });
  }
}
