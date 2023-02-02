require("dotenv").config();
const { ethers } = require("hardhat");
const { expect } = require("chai");
const { NFTStorage, Blob } = require("nft.storage");

const token = process.env.IPFS;

const client = new NFTStorage({ token });

describe("ERC725", function () {
  let erc725Contract;
  let nftContract;

  let bob;
  let alice;

  const Id = ethers.utils.hexZeroPad(
    ethers.BigNumber.from("12").toHexString(),
    32
  );

  const sampleLink =
    "https://bafkreiblu6yf35thyjzjhblimxiynxbewgn4dtjjozgjveuhrdmrfgx53a.ipfs.dweb.link/";

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

  it("checks interface", async function () {
    expect(await erc725Contract.supportsInterface("0x570ef073")).to.equal(true);
    expect(await erc725Contract.supportsInterface("0x714df77c")).to.equal(true);
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

  it("Mints to erc725 from user", async function () {
    expect(
      ethers.utils.formatEther(
        await ethers.provider.getBalance(erc725Contract.address)
      )
    ).to.equal("1.0");

    expect(await nftContract.balanceOf(bob.address)).to.equal(0);
    expect(await nftContract.totalSupply()).to.equal(0);

    await nftContract
      .connect(bob)
      .createPost(erc725Contract.address, sampleLink, Id);
    expect(await nftContract.balanceOf(erc725Contract.address)).to.equal(1);
    expect(await nftContract.totalSupply()).to.equal(1);
  });

  it("setData and getData works", async function () {
    await erc725Contract["setData(bytes32,bytes)"](Id, "0x0009");
    expect(await erc725Contract["getData(bytes32)"](Id)).to.equal("0x0009");
  });

  it("UP setData and getData works", async function () {
    const data = await erc725Contract["getData(bytes32)"](
      "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5"
    );
    expect(data).to.equal("0x");

    const hashFunction = ethers.utils
      .keccak256(ethers.utils.toUtf8Bytes("keccak256(utf8)"))
      .substr(0, 10);

    const json = JSON.stringify({
      myProperty: "is a string",
      anotherProperty: {
        sdfsdf: 123456,
      },
    });

    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(json));

    const blob = new Blob([json], { type: "application/json" });

    const cid = await client.storeBlob(blob);

    const url = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(`ipfs://${cid}`));

    const JSONURL = hashFunction + hash.substring(2) + url.substring(2);

    await erc725Contract["setData(bytes32,bytes)"](
      "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
      JSONURL
    );

    const dataProfile = await erc725Contract["getData(bytes32)"](
      "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5"
    );
    expect(dataProfile).to.equal(JSONURL);

    const hashFunctionToDecode = dataProfile.slice(0, 10);
    const urlToDecode = "0x" + dataProfile.slice(74);

    expect(hashFunctionToDecode).to.eq("0x6f357c6a");
    expect(ethers.utils.toUtf8String(urlToDecode).replace("ipfs://", "")).to.eq(
      cid
    );
  });
});
