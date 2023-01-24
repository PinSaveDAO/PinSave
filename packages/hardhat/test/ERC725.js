const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("ERC725", function () {
  let contract;

  let bob;

  beforeEach(async () => {
    [bob] = await ethers.getSigners();
    const nftContract = await ethers.getContractFactory("ERC725");
    contract = await nftContract.deploy(bob.address);

    await contract.deployed();
  });

  it("checks owner", async function () {
    expect(await contract.owner()).to.equal(bob.address);
  });
});
