const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("ERC725", function () {
  let erc725Contract;
  let nftContract;

  let bob;
  let alice;

  beforeEach(async () => {
    [bob, alice] = await ethers.getSigners();
    const identityContract = await ethers.getContractFactory("ERC725");
    erc725Contract = await identityContract.deploy(bob.address);

    const nfToken = await ethers.getContractFactory("LSP8PinSave");
    nftContract = await nfToken.deploy("name", "ABC", bob.address);

    await erc725Contract.deployed();

    await bob.sendTransaction({
      to: erc725Contract.address,
      value: ethers.utils.parseEther("1"),
      gasLimit: 5000000,
    });
  });

  it("reverts minting to zero address", async function () {
    const iContract = await ethers.getContractFactory("ERC725");
    expect(iContract.deploy(ethers.constants.AddressZero)).to.be.revertedWith(
      "Ownable: new owner is the zero address"
    );
  });

  it("checks owner", async function () {
    expect(await erc725Contract.owner()).to.equal(bob.address);
  });

  it("transfers eth from erc725", async function () {
    expect(
      ethers.utils.formatEther(
        await ethers.provider.getBalance(erc725Contract.address)
      )
    ).to.equal("1.0");

    await erc725Contract.execute(
      0,
      alice.address,
      ethers.utils.parseEther("0.1"),
      "0x"
    );

    expect(
      ethers.utils.formatEther(await ethers.provider.getBalance(alice.address))
    ).to.equal("10000.1");
  });

  it("Mints from erc725", async function () {
    expect(
      ethers.utils.formatEther(
        await ethers.provider.getBalance(erc725Contract.address)
      )
    ).to.equal("1.0");

    /*     await erc725Contract.execute(
      0,
      alice.address,
      ethers.utils.parseEther("0.1"),
      "0x"
    );

    expect(
      ethers.utils.formatEther(await ethers.provider.getBalance(alice.address))
    ).to.equal("10000.1"); */
  });
});
