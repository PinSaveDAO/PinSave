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

  const Id_1 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("13").toHexString(),
    32
  );

  const Id_2 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("14").toHexString(),
    32
  );

  const Id_3 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("15").toHexString(),
    32
  );
  const Id_4 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("16").toHexString(),
    32
  );
  const Id_5 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("17").toHexString(),
    32
  );
  const Id_6 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("18").toHexString(),
    32
  );
  const Id_7 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("19").toHexString(),
    32
  );
  const Id_8 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("20").toHexString(),
    32
  );
  const Id_9 = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("21").toHexString(),
    32
  );

  const sampleLink =
    "https://bafkreiblu6yf35thyjzjhblimxiynxbewgn4dtjjozgjveuhrdmrfgx53a.ipfs.dweb.link/";

  const sampleLink_1 =
    "https://bafkreiblu6yf35thyjzjhblimxiynxbewgn4dtjjozgjveuhrdmrfgx53a.ipfs.dweb.link/";

  beforeEach(async () => {
    [bob, jane] = await ethers.getSigners();
    const nftContract = await ethers.getContractFactory("LSP8PinSave");
    nfToken = await nftContract.deploy("name", "N", bob.address);

    await nfToken.deployed();
  });

  it("correctly deployed", async function () {
    expect(await nfToken.balanceOf(bob.address)).to.equal(0);
    expect(await nfToken.totalSupply()).to.equal(0);
  });

  it("mints", async function () {
    await nfToken.connect(bob).createPost(bob.address, sampleLink, Id);
    expect(await nfToken.balanceOf(bob.address)).to.equal(1);
    expect(await nfToken.totalSupply()).to.equal(1);
  });

  it("tokenIdsOf", async function () {
    await nfToken.connect(bob).createPost(bob.address, sampleLink, Id);
    const eId = await nfToken.tokenIdsOf(bob.address);
    expect(eId[0]).to.equal(Id);
  });

  it("token owner", async function () {
    await nfToken.connect(bob).createPost(bob.address, sampleLink, Id);
    expect(await nfToken.tokenOwnerOf(Id)).to.equal(bob.address);
  });

  it("check cid", async function () {
    await nfToken.connect(bob).createPost(bob.address, sampleLink, Id);
    expect(await nfToken.getPost(1)).to.equal(sampleLink);
  });

  it("checks post owner", async function () {
    await nfToken.connect(bob).createPost(bob.address, sampleLink, Id);
    expect(await nfToken.getPostOwner(1)).to.equal(bob.address);
  });

  it("transfers", async function () {
    await nfToken.connect(bob).createPost(bob.address, sampleLink, Id);
    await nfToken
      .connect(bob)
      .transfer(bob.address, jane.address, Id, true, "0x00");
    expect(await nfToken.balanceOf(bob.address)).to.equal(0);
    expect(await nfToken.totalSupply()).to.equal(1);
  });

  it("checks post creator", async function () {
    await nfToken.connect(bob).createPost(bob.address, sampleLink, Id);
    await nfToken
      .connect(bob)
      .transfer(bob.address, jane.address, Id, true, "0x00");
    expect(await nfToken.getCreator(1)).to.equal(bob.address);
  });

  it("mints multiple posts", async function () {
    await nfToken
      .connect(bob)
      .createBatchPosts(
        bob.address,
        [
          sampleLink,
          sampleLink_1,
          sampleLink,
          sampleLink_1,
          sampleLink,
          sampleLink_1,
          sampleLink,
          sampleLink_1,
          sampleLink,
          sampleLink_1,
        ],
        [Id, Id_1, Id_2, Id_3, Id_4, Id_5, Id_6, Id_7, Id_8, Id_9]
      );
    expect(await nfToken.totalSupply()).to.equal(10);
    expect(await nfToken.balanceOf(bob.address)).to.equal(10);
    const eIds = await nfToken.tokenIdsOf(bob.address);
    expect(eIds[0]).to.equal(Id);
    expect(eIds[1]).to.equal(Id_1);
  });
});
