import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { LSPFactory } from "@lukso/lsp-factory.js";
import { useAccount } from "wagmi";

const schema = [
  {
    name: "SupportedStandards:LSP3UniversalProfile",
    key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6",
    keyType: "Mapping",
    valueContent: "0xabe425d6",
    valueType: "bytes",
  },
  {
    name: "LSP3Profile",
    key: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
    keyType: "Singleton",
    valueContent: "JSONURL",
    valueType: "bytes",
  },
  {
    name: "LSP1UniversalReceiverDelegate",
    key: "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47",
    keyType: "Singleton",
    valueContent: "Address",
    valueType: "address",
  },
];

async function createUniversalProfile(publicAddress: string) {
  const lspFactory = new LSPFactory("https://rpc.l16.lukso.network", {
    deployKey: process.env.NEXT_PUBLIC_KEY,
    chainId: 2828,
  });

  const deployedContracts = await lspFactory.UniversalProfile.deploy({
    controllerAddresses: [publicAddress], // our EOA that will be controlling the UP
    lsp3Profile: {
      name: "My Universal Profile",
      description: "My Cool Universal Profile",
      tags: ["Public Profile"],
      links: [
        {
          title: "My Website",
          url: "https://my-website.com",
        },
      ],
    },
  });

  return deployedContracts;
}

const Upload: NextPage = () => {
  const { address } = useAccount();
  const [hasUP, setUP] = useState(false);

  useEffect(() => {
    if (address) {
      const va = createUniversalProfile(address);
      console.log(va);
    }
  }, [address]);
  return (
    <button
      onClick={() => (address ? createUniversalProfile(address) : "")}
    ></button>
  );
};

export default Upload;
