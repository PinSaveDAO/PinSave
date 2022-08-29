import { ERC725 } from "@erc725/erc725.js";
import LSP6Schema from "@erc725/erc725.js/schemas/LSP6KeyManager.json";
import Web3 from "web3";

const data = [];

export default function handler(request, response) {
  const { addr } = request.query;

  const myUniversalProfileAddress = addr;
  const RPC_ENDPOINT = "https://rpc.l16.lukso.network";

  const web3 = new Web3(RPC_ENDPOINT);
  const erc725 = new ERC725(
    LSP6Schema,
    myUniversalProfileAddress,
    web3.currentProvider
  );

  const result = erc725.getData("AddressPermissions[]");

  function getS(result) {
    for (let ii = 0; ii < result.value.length; ii++) {
      const address = result.value[ii];
      erc725
        .getData({
          keyName: "AddressPermissions:Permissions:<address>",
          dynamicKeyParts: address,
        })
        .then((addressPermission) =>
          erc725.decodePermissions(addressPermission.value)
        )
        .then((decodedPermission) =>
          data.push({ decodedPermission, address: address })
        );
    }
  }

  return result
    .then((fetchedData) => getS(fetchedData))
    .then(() => response.status(200).json({ data }));
}
