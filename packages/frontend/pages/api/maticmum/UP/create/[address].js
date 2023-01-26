import { LSPFactory } from "@lukso/lsp-factory.js";

export default async function handler(req, res) {
  try {
    const { address } = req.query;

    const provider = "https://rpc-mumbai.maticvigil.com/";

    const lspFactory = new LSPFactory(provider, {
      deployKey: process.env.NEXT_PUBLIC_PRIVATE_KEY, // Private key of the account which will deploy smart contracts
      chainId: 80001,
    });

    const myLSP3MetaData =
      "ipfs://QmPzUfdKhY6vfcTNDnitwKnnpm5GqjYSmw9todNVmi4bqy";

    const myContracts = await lspFactory.UniversalProfile.deploy({
      controllerAddresses: [address], // Account addresses which will control the UP
      lsp3Profile: myLSP3MetaData,
    });

    const myUPAddress = myContracts.LSP0ERC725Account.address;

    res.status(200).json(myUPAddress);
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
