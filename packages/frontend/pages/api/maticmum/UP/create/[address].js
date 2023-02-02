import ERC725 from "@/contracts/ERC725.json";
import { ContractFactory, providers, Wallet } from "ethers";

export default async function handler(req, res) {
  try {
    const { address } = req.query;
    const provider = new providers.InfuraProvider("maticmum");
    const wallet = new Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY);
    const account = wallet.connect(provider);

    const factory = new ContractFactory(ERC725.abi, ERC725.bytecode, account);
    const contract = await factory.deploy(address);

    res.status(200).json(contract.address);
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
