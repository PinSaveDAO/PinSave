import { LSPFactory } from "@lukso/lsp-factory.js";

export default function handler(req, res) {
  try {
    const { address } = req.query;

    const lspFactory = new LSPFactory("https://rpc.l14.lukso.network", {
      deployKey: process.env.NEXT_PRIVATE_KEY,
      chainId: 22,
    });

    const deployedContracts = lspFactory.UniversalProfile.deploy({
      controllerAddresses: [address], // our EOA that will be controlling the UP
      lsp3Profile: {
        name: "My Universal Profile",
        description: "My Cool Universal Profile",
        tags: ["Public Profile"],
        links: [
          {
            title: "My Website",
            url: "https://my.com",
          },
        ],
      },
    });

    deployedContracts.then((v) => res.status(200).json({ v }));
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" });
  }
}
