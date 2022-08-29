const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("PinSave Contract", function () {
  let nfToken;

  let bob;
  let jane;
  // let sara;

  const sampleLink =
    "https://bafkreiblu6yf35thyjzjhblimxiynxbewgn4dtjjozgjveuhrdmrfgx53a.ipfs.dweb.link/";

  // const altLink =
  // ("https://bafkreic5yqlwax3w46ugurxbbn2qlvqgdhkaiykqgxgrv2ozrqzjdzmipq.ipfs.dweb.link/");

  beforeEach(async () => {
    const nftContract = await ethers.getContractFactory("YourContract");
    nfToken = await nftContract.deploy();
    [bob, jane] = await ethers.getSigners();
    // console.log(bob.address);
    await nfToken.deployed();
  });

  it("correctly checks all the supported interfaces", async function () {
    expect(await nfToken.supportsInterface("0x80ac58cd")).to.equal(true);
    expect(await nfToken.supportsInterface("0x5b5e139f")).to.equal(true);
  });

  it("returns the correct NFT id 1 url", async function () {
    await nfToken.mintPost(bob.address, sampleLink);
    expect(await nfToken.tokenURI(1)).to.equal(sampleLink);
  });

  it("correctly mints a NFT", async function () {
    expect(await nfToken.mintPost(bob.address, sampleLink)).to.emit(
      nfToken,
      "Transfer"
    );
    expect(await nfToken.balanceOf(bob.address)).to.equal(1);
    expect(await nfToken.totalSupply()).to.equal(1);
  });

  it("returns the correct contract name", async function () {
    expect(await nfToken.name()).to.equal("PinSave");
  });

  it("returns the correct contract symbol", async function () {
    expect(await nfToken.symbol()).to.equal("PNS");
  });

  it("transfer", async function () {
    await nfToken.mintPost(bob.address, sampleLink);
    await nfToken.transferFrom(bob.address, jane.address, 1);
    expect(await nfToken.balanceOf(bob.address)).to.equal(0);
    expect(await nfToken.balanceOf(jane.address)).to.equal(1);
  });
});
