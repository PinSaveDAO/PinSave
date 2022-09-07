import { ERC725 } from "@erc725/erc725.js";
import LSP6Schema from "@erc725/erc725.js/schemas/LSP6KeyManager.json";
import Web3 from "web3";

export default async function handler(request, response) {
  try {
    const { addr } = request.query;

    const myUniversalProfileAddress = addr;
    const RPC_ENDPOINT = "https://rpc.l16.lukso.network";

    const web3 = new Web3(RPC_ENDPOINT);

    const erc725 = new ERC725(
      LSP6Schema,
      myUniversalProfileAddress,
      web3.currentProvider
    );

    const erc725Data = await erc725.getData("AddressPermissions[]");

    async function getControllers(result) {
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

    const data = await getControllers(erc725Data);

    return response.status(200).json({ data });
  } catch (e) {
    response.status(500).send({ error: "failed to fetch data" });
  }
}
