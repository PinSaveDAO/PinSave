const { LSPFactory } = require("@lukso/lsp-factory.js");

async function na() {
  const provider = "https://rpc.l14.lukso.network";

  const bob = process.env.PRIVATE_KEY;
  const lspFactory = new LSPFactory(provider, {
    deployKey: bob, // Private key of the account which will deploy smart contracts
    chainId: 22,
  });

  await lspFactory.LSP7DigitalAsset.deploy(
    {
      controllerAddress: "0xcC4E089687849a02Eb2D9Ec2da55BE394137CCc7",
      name: "MYTOKEN",
      symbol: "DEMO",
      isNFT: true,
    },
    {
      onDeployEvents: {
        next: (deploymentEvent) => {
          console.log(deploymentEvent);
        },
        error: (error) => {
          console.error(error);
        },
        complete: (contracts) => {
          console.log("Deployment Complete");
          console.log(contracts.LSP7DigitalAsset.address);
        },
      },
    }
  );
}

na();
