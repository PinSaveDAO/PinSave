import { LSPFactory } from "@lukso/lsp-factory.js";

export default function handler(request, response) {
  const { method } = request;

  if (method === "GET") {
    try {
      response.send("ad");
      const { address } = request.query;

      const lspFactory = new LSPFactory("https://rpc.l16.lukso.network", {
        deployKey: process.env.NEXT_PRIVATE_KEY,
        chainId: 2828,
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

      return deployedContracts.then((v) => response.status(200).json({ v }));
    } catch (err) {
      return response.status(500).send({ error: "failed to fetch data" });
    }
  }

  if (method === "POST") {
    try {
      const { address } = request.query;
      const { body } = request;

      const lspFactory = new LSPFactory("https://rpc.l16.lukso.network", {
        deployKey: process.env.NEXT_PRIVATE_KEY,
        chainId: 2828,
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

      return deployedContracts.then((v) => response.status(200).json({ v }));
    } catch (err) {
      return response.status(500).send({ error: "failed to fetch data" });
    }
  }
}
