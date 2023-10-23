//import ERC725 from "@/contracts/ERC725.json";
//import { ethers } from "ethers";

/* export default async function handler(req, res) {
  try {
    const { address } = req.query;

    let profile;

    const provider = new ethers.providers.AlchemyProvider(
      "maticmum",
      process.env.NEXT_ALCHEMY_ID
    );

    const erc725 = new ethers.Contract(
      address,
      ERC725.abi,
      new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY, provider)
    );

    const owner = await erc725.owner();

    const data = await erc725["getData(bytes32)"](
      "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5"
    );

    const hashFunction = data.slice(0, 10);
    const url = "0x" + data.slice(74);

    // check if it uses keccak256
    if (hashFunction === "0x6f357c6a") {
      profile = ethers.utils.toUtf8String(url);
    }

    res.status(200).json({ owner: owner, profile: profile });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
} */
