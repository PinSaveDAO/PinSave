const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("ERC725", function () {
  let er725Contract;
  let nftContract;

  let bob;
  let alice;

  beforeEach(async () => {
    [bob, alice] = await ethers.getSigners();
    const identityContract = await ethers.getContractFactory("ERC725");
    er725Contract = await identityContract.deploy(bob.address);

    const nfToken = await ethers.getContractFactory("LSP8PinSave");
    nftContract = await nfToken.deploy("name", "ABC", bob.address);

    await er725Contract.deployed();
  });

  it("reverts minting to zero address", async function () {
    const iContract = await ethers.getContractFactory("ERC725");
    expect(iContract.deploy(ethers.constants.AddressZero)).to.be.revertedWith(
      "Ownable: new owner is the zero address"
    );
  });

  it("checks owner", async function () {
    expect(await er725Contract.owner()).to.equal(bob.address);
  });

  it("calls from erc725", async function () {
    console.log(
      ethers.utils.formatEther(await ethers.provider.getBalance(bob.address))
    );

    await bob.sendTransaction({
      to: er725Contract.address,
      value: ethers.utils.parseEther("1"),
      gasLimit: 5000000,
    });

    console.log(
      ethers.utils.formatEther(await ethers.provider.getBalance(bob.address))
    );

    console.log(
      ethers.utils.formatEther(
        await ethers.provider.getBalance(er725Contract.address)
      )
    );

    await er725Contract.execute(
      0,
      alice.address,
      ethers.utils.parseEther("0.1"),
      "0x"
    );

    expect(
      ethers.utils.formatEther(await ethers.provider.getBalance(alice.address))
    ).to.equal("10000.1");
  });
});
