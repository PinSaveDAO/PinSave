import { ref, object, string, boolean, positive, integer } from "yup";
import LSP7DigitalAsset from "@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json";
import LSP0ERC725Account from "@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json";
const LSP7Mintable = require("@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json");

import Web3 from "web3";

const data = [];
export default async function handler(request, response) {
  const { method } = request;

  const RPC_ENDPOINT = "https://rpc.l14.lukso.network";

  const web3 = new Web3(RPC_ENDPOINT);
  const myEOA = web3.eth.accounts.privateKeyToAccount(
    process.env.NEXT_PRIVATE_KEY
  );

  console.log(myEOA);

  const myContract = new web3.eth.Contract(
    LSP7Mintable.abi,
    "0x5019779d94b4eB8853ceE3497E7AB78b0B01De67"
  );
  /* 
  const OPERATION_CALL = 0;

  const targetPayload = targetContract.methods.totalSupply().encodeABI();

  let abiPayload = await myUp.methods
    .execute(OPERATION_CALL, targetContract.address, 0, targetPayload)
    .encodeABI();

  // 3. execute via the KeyManager, passing the UP payload
  await myKeyManager.methods.execute(abiPayload).send({
    from: "<address-of-up-owner>",
    gasLimit: 300_000,
  }); */
  //const sup = await myContract.methods.totalSupply();
  //console.log(sup);

  console.log(
    await myContract.methods
      .balanceOf("0x5019779d94b4eB8853ceE3497E7AB78b0B01De67")
      .call()
  );

  console.log(await myContract.methods.totalSupply().call());

  console.log(
    await myContract.methods
      .mint("0x5019779d94b4eB8853ceE3497E7AB78b0B01De67", 100, false, "0x")
      .call()
  );

  if (method === "GET") {
    return response.status(200).json({ data });
  }

  if (method === "POST") {
    const { body } = request;
    let userSchema = object().shape({
      firstName: string().required(),
      // age: number().required(),
      //email: string().email(),
      //website: string().url().nullable(),
      //createdOn: date().default(() => new Date()),
    });

    // parse and assert validity
    userSchema.isValid({ ...body }).then(function (valid) {
      if (valid) {
        response.status(200).json({ ...body, id: 1 });
      }

      if (!valid) {
        response.status(500).json({ error: "failed to fetch data" });
      }
    });
    //data.push({ ...body, id: data.length + 1 });

    //return response.status(200).json({ ...body });
  }
}
