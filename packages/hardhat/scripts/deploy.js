const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // We get the contract to deploy
  const MyERC721NFT = await ethers.getContractFactory("YourContract");
  const contract = await MyERC721NFT.deploy({
    // gasPrice: ethers.BigNumber.from(20000000000),
  });
  console.log("deploying to:", contract.address);
  await contract.deployed();

  console.log("deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
