const web3 = require("web3");

const LSP7Mintable = require("@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json");
const { ethers } = require("hardhat");

async function na() {
  const [myEOA] = await ethers.getSigners();

  // create an instance
  const myToken = new web3.eth.Contract(LSP7Mintable.abi, {
    gas: 5000000,
    gasPrice: "1000000000",
  });

  // deploy the token contract
  await myToken
    .deploy({
      data: LSP7Mintable.bytecode,
      arguments: [
        "My LSP7 Token", // token name
        "LSP7", // token symbol
        myEOA, // new owner, who will mint later
        false, // isNonDivisible = TRUE, means NOT divisible, decimals = 0)
      ],
    })
    .send({
      from: myEOA,
    });
}

na();
