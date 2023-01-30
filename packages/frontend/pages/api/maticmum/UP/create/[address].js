import { LSPFactory } from "@lukso/lsp-factory.js";

export default async function handler(req, res) {
  try {
    const { address } = req.query;

    const provider = "https://rpc-mumbai.maticvigil.com/";

    const lspFactory = new LSPFactory(provider, {
      deployKey: process.env.NEXT_PUBLIC_PRIVATE_KEY, // Private key of the account which will deploy smart contracts
      chainId: 80001,
    });

    const myLSP3MetaData = {
      name: "My Universal Profile",
      description: "My cool Universal Profile",
      profileImage: [
        {
          width: 500,
          height: 500,
          hashFunction: "keccak256(bytes)",
          // bytes32 hex string of the image hash
          hash: "0xfdafad027ecfe57eb4ad047b938805d1dec209d6e9f960fc320d7b9b11cbed14",
          url: "ipfs://QmPLqMFHxiUgYAom3Zg4SiwoxDaFcZpHXpCmiDzxrtjSGp",
        },
      ],
      backgroundImage: [
        {
          width: 500,
          height: 500,
          hashFunction: "keccak256(bytes)",
          // bytes32 hex string of the image hash
          hash: "0xfdafad027ecfe57eb4ad047b938805d1dec209d6e9f960fc320d7b9b11cbed14",
          url: "ipfs://QmPLqMFHxiUgYAom3Zg4SiwoxDaFcZpHXpCmiDzxrtjSGp",
        },
      ],
      tags: ["public profile", "creator"],
      links: [
        {
          title: "My Website",
          url: "www.my-website.com",
        },
      ],
    };

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
