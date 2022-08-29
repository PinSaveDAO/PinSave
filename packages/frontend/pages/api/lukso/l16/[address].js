import Web3 from "web3";
import LSP3UniversalProfileMetadata from "@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json";
import { ERC725 } from "@erc725/erc725.js";

export default function handler(req, res) {
  try {
    const { address } = req.query;

    const provider = new Web3.providers.HttpProvider(
      "https://rpc.l16.lukso.network"
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

    let outData;

    function validate(data) {
      outData = data;
      console.log(...outData);
      res.status(200).json({ ProfileData: outData });
    }

    const profileData = erc725.fetchData();

    profileData.then((fetchedData) => validate(fetchedData));
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" });
  }
}
