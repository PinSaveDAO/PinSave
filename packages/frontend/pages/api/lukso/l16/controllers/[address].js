import { ERC725 } from "@erc725/erc725.js";
import LSP6Schema from "@erc725/erc725.js/schemas/LSP6KeyManager.json";
import Web3 from "web3";

export default function handler(request, response) {
  const { address } = request.query;

  const myUniversalProfileAddress = address;
  const RPC_ENDPOINT = "https://rpc.l16.lukso.network";

  const web3 = new Web3(RPC_ENDPOINT);
  const erc725 = new ERC725(
    LSP6Schema,
    myUniversalProfileAddress,
    web3.currentProvider
  );
  const result = erc725.getData("AddressPermissions[]");

  return result.then((controllers) =>
    response.status(200).json({ controllers })
  );
}
