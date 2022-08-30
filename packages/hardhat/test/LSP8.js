const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("LSP8", function () {
  let nfToken;

  let bob;
  let jane;

  beforeEach(async () => {
    [bob, jane] = await ethers.getSigners();
    const nftContract = await ethers.getContractFactory("PinSaveL8");
    nfToken = await nftContract.deploy("name", "N", bob.address);

    await nfToken.deployed();
  });

  it("correctly deployed", async function () {
    expect(await nfToken.balanceOf(bob.address)).to.equal(0);
    expect(await nfToken.totalSupply()).to.equal(0);
  });

  it("mints", async function () {
    await nfToken
      .connect(bob)
      .mint(
        bob.address,
        ethers.utils.hexZeroPad(ethers.BigNumber.from("12").toHexString(), 32),
        true,
        "0x00"
      );
    expect(await nfToken.balanceOf(bob.address)).to.equal(1);
    expect(await nfToken.totalSupply()).to.equal(1);
  });

  it("transfers", async function () {
    await nfToken
      .connect(bob)
      .mint(
        bob.address,
        ethers.utils.hexZeroPad(ethers.BigNumber.from("12").toHexString(), 32),
        true,
        "0x00"
      );
    await nfToken
      .connect(bob)
      .transfer(
        bob.address,
        jane.address,
        ethers.utils.hexZeroPad(ethers.BigNumber.from("12").toHexString(), 32),
        true,
        "0x00"
      );
    expect(await nfToken.balanceOf(bob.address)).to.equal(0);
    expect(await nfToken.totalSupply()).to.equal(1);
  });
});
