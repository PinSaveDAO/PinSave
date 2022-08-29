require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.15",
  networks: {
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY, process.env.UP_PK],
    },
    l16: {
      url: "https://rpc.l16.lukso.network",
      accounts: [process.env.PRIVATE_KEY, process.env.UP_PK],
      chainId: 2828,
      live: true,
    },
    l14: {
      url: "https://rpc.l14.lukso.network",
      accounts: [process.env.PRIVATE_KEY, process.env.UP_PK],
      chainId: 22,
    },
  },
};
