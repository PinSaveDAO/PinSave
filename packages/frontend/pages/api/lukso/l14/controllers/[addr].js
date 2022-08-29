import { ERC725 } from "@erc725/erc725.js";
import LSP6Schema from "@erc725/erc725.js/schemas/LSP6KeyManager.json";
import Web3 from "web3";

export default async function handler(request, response) {
  const { addr } = request.query;

  const myUniversalProfileAddress = addr;
  const RPC_ENDPOINT = "https://rpc.l14.lukso.network";

  const web3 = new Web3(RPC_ENDPOINT);

  const erc725 = new ERC725(
    LSP6Schema,
    myUniversalProfileAddress,
    web3.currentProvider
  );

  const erc725Data = erc725.getData("AddressPermissions[]");

  async function getS(result) {
    const data = [];
    for (let ii = 0; ii < result.value.length; ii++) {
      const address = result.value[ii];
      const addressPermission = await erc725.getData({
        keyName: "AddressPermissions:Permissions:<address>",
        dynamicKeyParts: address,
      });

      const decodedPermission = erc725.decodePermissions(
        addressPermission.value
      );

      data.push({ ...decodedPermission, address: address });
    }
    return data;
  }

  return erc725Data
    .then((fetchedData) => getS(fetchedData))
    .then((data) => response.status(200).json({ data }));
}
