const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("LSP8", function () {
  let nftContract;

  let bob;
  let jane;

  const Id = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("12").toHexString(),
    32
  );

  const Id1 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("13").toHexString(),
    32
  );

  const Id2 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("14").toHexString(),
    32
  );

  const Id3 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("15").toHexString(),
    32
  );
  const Id4 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("16").toHexString(),
    32
  );
  const Id5 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("17").toHexString(),
    32
  );
  const Id6 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("18").toHexString(),
    32
  );
  const Id7 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("19").toHexString(),
    32
  );
  const Id8 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("20").toHexString(),
    32
  );
  const Id9 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("21").toHexString(),
    32
  );

  const sampleLink =
    "https://bafkreiblu6yf35thyjzjhblimxiynxbewgn4dtjjozgjveuhrdmrfgx53a.ipfs.dweb.link/";

  const sampleLink1 =
    "https://bafkreiblu6yf35thyjzjhblimxiynxbewgn4dtjjozgjveuhrdmrfgx53a.ipfs.dweb.link/";

  beforeEach(async () => {
    [bob, jane] = await ethers.getSigners();
    const nftFactory = await ethers.getContractFactory("LSP8PinSave");
    nftContract = await nftFactory.deploy("name", "N", bob.address);

    await nftContract.deployed();
  });

  it("correctly deployed", async function () {
    expect(await nftContract.balanceOf(bob.address)).to.equal(0);
    expect(await nftContract.totalSupply()).to.equal(0);
  });

  it("mints", async function () {
    await nftContract.connect(bob).createPost(bob.address, sampleLink, Id);
    expect(await nftContract.balanceOf(bob.address)).to.equal(1);
    expect(await nftContract.totalSupply()).to.equal(1);
  });

  it("tokenIdsOf", async function () {
    await nftContract.connect(bob).createPost(bob.address, sampleLink, Id);
    const eId = await nftContract.tokenIdsOf(bob.address);
    expect(eId[0]).to.equal(Id);
  });

  it("token owner", async function () {
    await nftContract.connect(bob).createPost(bob.address, sampleLink, Id);
    expect(await nftContract.tokenOwnerOf(Id)).to.equal(bob.address);
  });

  it("check cid", async function () {
    await nftContract.connect(bob).createPost(bob.address, sampleLink, Id);
    expect(await nftContract.getPost(1)).to.equal(sampleLink);
  });

  it("checks post owner", async function () {
    await nftContract.connect(bob).createPost(bob.address, sampleLink, Id);
    expect(await nftContract.getPostOwner(1)).to.equal(bob.address);
  });

  it("transfers", async function () {
    await nftContract.connect(bob).createPost(bob.address, sampleLink, Id);
    await nftContract
      .connect(bob)
      .transfer(bob.address, jane.address, Id, true, "0x00");
    expect(await nftContract.balanceOf(bob.address)).to.equal(0);
    expect(await nftContract.totalSupply()).to.equal(1);
  });

  it("checks post creator", async function () {
    await nftContract.connect(bob).createPost(bob.address, sampleLink, Id);
    await nftContract
      .connect(bob)
      .transfer(bob.address, jane.address, Id, true, "0x00");
    expect(await nftContract.getCreator(1)).to.equal(bob.address);
  });

  it("mints multiple posts", async function () {
    await nftContract
      .connect(bob)
      .createBatchPosts(
        bob.address,
        [
          sampleLink,
          sampleLink1,
          sampleLink,
          sampleLink1,
          sampleLink,
          sampleLink1,
          sampleLink,
          sampleLink1,
          sampleLink,
          sampleLink1,
        ],
        [Id, Id1, Id2, Id3, Id4, Id5, Id6, Id7, Id8, Id9]
      );
    expect(await nftContract.totalSupply()).to.equal(10);
    expect(await nftContract.balanceOf(bob.address)).to.equal(10);
    const eIds = await nftContract.tokenIdsOf(bob.address);
    expect(eIds[0]).to.equal(Id);
    expect(eIds[1]).to.equal(Id1);
  });
});
