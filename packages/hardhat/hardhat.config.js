require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
    l16: {
      url: "https://rpc.l16.lukso.network",
      accounts: [process.env.PRIVATE_KEY],
    },
    l14: {
      url: "https://rpc.l14.lukso.network",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
