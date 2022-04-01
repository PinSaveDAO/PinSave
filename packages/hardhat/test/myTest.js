const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("PinSave", function () {
  let myContract;
  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("YourContract", function () {
    it("Should deploy YourContract", async function () {
      const YourContract = await ethers.getContractFactory("YourContract");

      myContract = await YourContract.deploy();
    });

    describe("mint()", function () {
      it("Mint New NFT", async function () {
        const [owner] = await ethers.getSigners();
        const sampleLink =
          "https://bafkreiblu6yf35thyjzjhblimxiynxbewgn4dtjjozgjveuhrdmrfgx53a.ipfs.dweb.link/";

        await myContract.mintPost(owner.address, sampleLink);
        expect(await myContract.tokenURI(1)).to.equal(sampleLink);
      });

      it("Minting should emit a Transfer event ", async function () {
        const [owner] = await ethers.getSigners();

        const altLink =
          "https://bafkreic5yqlwax3w46ugurxbbn2qlvqgdhkaiykqgxgrv2ozrqzjdzmipq.ipfs.dweb.link/";

        expect(await myContract.mintPost(owner.address, altLink))
          .to.emit(myContract, "Transfer")
          .withArgs(
            "0x0000000000000000000000000000000000000000",
            owner.address,
            2
          );
      });
      it("check totalSupply", async () => {
        expect(await myContract.totalSupply()).to.equal(2);
      });
    });
  });
});
