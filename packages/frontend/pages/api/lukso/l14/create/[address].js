import { LSPFactory } from "@lukso/lsp-factory.js";

export default async function handler(request, response) {
  const { address } = request.query;
  const { method } = request;

  if (method === "GET") {
    try {
      const lspFactory = new LSPFactory("https://rpc.l14.lukso.network", {
        deployKey: process.env.NEXT_PRIVATE_KEY,
        chainId: 22,
      });

      const deployedContracts = await lspFactory.UniversalProfile.deploy({
        controllerAddresses: [address],
        lsp3Profile: {
          name: "My Universal Profile",
        },
      });

      response.status(200).json({ Deployed: deployedContracts });
    } catch (err) {
      response
        .status(500)
        .send({ error: `failed to fetch data for ${address}` + err });
    }
  }

  if (method === "POST") {
    const { body } = request;
    console.log(body);
    try {
      const lspFactory = new LSPFactory("https://rpc.l14.lukso.network", {
        deployKey: process.env.NEXT_PRIVATE_KEY,
        chainId: 22,
      });

      const deployedContracts = await lspFactory.UniversalProfile.deploy({
        controllerAddresses: [address],
        lsp3Profile: {
          ...body,
        },
      });

      response.status(200).json({ Deployed: deployedContracts });
    } catch (err) {
      response.status(500).send({ error: "failed to fetch data" });
    }
  }
}
