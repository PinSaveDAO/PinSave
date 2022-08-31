import { LSPFactory } from "@lukso/lsp-factory.js";

export default function handler(request, response) {
  const { address } = request.query;
  const { method } = request;

  if (method === "GET") {
    try {
      const lspFactory = new LSPFactory("https://rpc.l16.lukso.network", {
        deployKey: process.env.NEXT_PRIVATE_KEY,
        chainId: 2828,
      });

      const deployedContracts = lspFactory.UniversalProfile.deploy({
        controllerAddresses: [address],
        lsp3Profile: {
          name: "My Universal Profile",
        },
      });

      deployedContracts.then((v) => response.status(200).json({ v }));
    } catch (err) {
      response.status(500).send({ error: "failed to fetch data" });
    }
  }

  if (method === "POST") {
    const { body } = request;
    console.log(body);
    try {
      const lspFactory = new LSPFactory("https://rpc.l16.lukso.network", {
        deployKey: process.env.NEXT_PRIVATE_KEY,
        chainId: 2828,
      });

      const deployedContracts = lspFactory.UniversalProfile.deploy({
        controllerAddresses: [address],
        lsp3Profile: {
          ...body,
        },
      });

      deployedContracts.then((v) => response.status(200).json({ v }));
    } catch (err) {
      response.status(500).send({ error: "failed to fetch data" });
    }
  }
}
