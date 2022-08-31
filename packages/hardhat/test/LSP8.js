const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("LSP8", function () {
  let nfToken;

  let bob;
  let jane;

  const Id = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("12").toHexString(),
    32
  );

  const sampleLink =
    "https://bafkreiblu6yf35thyjzjhblimxiynxbewgn4dtjjozgjveuhrdmrfgx53a.ipfs.dweb.link/";

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
    await nfToken.connect(bob).createPost(sampleLink, Id);
    expect(await nfToken.balanceOf(bob.address)).to.equal(1);
    expect(await nfToken.totalSupply()).to.equal(1);
  });

  it("transfers", async function () {
    await nfToken.connect(bob).createPost(sampleLink, Id);
    await nfToken
      .connect(bob)
      .transfer(bob.address, jane.address, Id, true, "0x00");
    expect(await nfToken.balanceOf(bob.address)).to.equal(0);
    expect(await nfToken.totalSupply()).to.equal(1);
  });

  it("tokenIdsOf", async function () {
    await nfToken.connect(bob).createPost(sampleLink, Id);
    const eId = await nfToken.tokenIdsOf(bob.address);
    expect(eId[0]).to.equal(Id);
  });

  it("token owner", async function () {
    await nfToken.connect(bob).createPost(sampleLink, Id);
    expect(await nfToken.tokenOwnerOf(Id)).to.equal(bob.address);
  });

  it("check cid", async function () {
    await nfToken.connect(bob).createPost(sampleLink, Id);
    expect(await nfToken.getPost(1)).to.equal(sampleLink);
  });
});
