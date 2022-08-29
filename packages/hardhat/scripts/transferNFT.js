const { ethers } = require("hardhat");

async function main() {
  const [bob, jane] = await ethers.getSigners();

  console.log("Bob account:", bob.address);

  console.log("Account balance:", (await bob.getBalance()).toString());

  console.log("Bob account:", jane.address);
  console.log("Account balance:", (await jane.getBalance()).toString());

  const MyERC721NFT = await ethers.getContractFactory("YourContract");

  const contract = await MyERC721NFT.attach(
    "0x18587c47ce8eb3a2ee11bb19b6abc92d6531d285"
  );

  await contract.transferFrom(bob.address, jane.address, 1, {
    gasPrice: ethers.BigNumber.from(20000000000),
  });

  console.log("finito");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
