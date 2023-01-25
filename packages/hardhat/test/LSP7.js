const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("LSP7", function () {
  let nfToken;

  let bob;
  let jane;

  const sampleLink =
    "https://bafkreiblu6yf35thyjzjhblimxiynxbewgn4dtjjozgjveuhrdmrfgx53a.ipfs.dweb.link/";

  beforeEach(async () => {
    [bob, jane] = await ethers.getSigners();
    const nftContract = await ethers.getContractFactory("PinSave");
    nfToken = await nftContract.deploy("name", "ABC", bob.address, false);

    await nfToken.deployed();
  });

  it("correctly deployed", async function () {
    expect(await nfToken.balanceOf(bob.address)).to.equal(0);
    expect(await nfToken.totalSupply()).to.equal(0);
  });

  it("mints single NFT", async function () {
    await nfToken.connect(bob).createPost(sampleLink, 1);
    expect(await nfToken.balanceOf(bob.address)).to.equal(1);
    expect(await nfToken.totalSupply()).to.equal(1);
  });

  it("mints multiple", async function () {
    await nfToken.connect(bob).createPost(sampleLink, 3);
    expect(await nfToken.balanceOf(bob.address)).to.equal(3);
    expect(await nfToken.totalSupply()).to.equal(3);
  });

  it("transfers", async function () {
    await nfToken.connect(bob).createPost(sampleLink, 1);
    await nfToken
      .connect(bob)
      .transfer(bob.address, jane.address, 1, true, "0x00");
    expect(await nfToken.balanceOf(bob.address)).to.equal(0);
    expect(await nfToken.totalSupply()).to.equal(1);
  });
});
