# Pin Save - decentralized Pinterest

<p align="center">
  <img src="https://raw.githubusercontent.com/Pfed-prog/Dspyt-NFTs-EVM/master/assets/PinSaveL.png" alt="Size Limit CLI" width="738" >
</p>

<p align="center">
    <a href="https://twitter.com/intent/follow?screen_name=pinsav3">
        <img src="https://img.shields.io/twitter/follow/pinsav3?style=social"
            alt="follow on Twitter"></a>
</p>

<div align="center">

[Features](#features) •
[Setup](#setup) •
[Resources](#further-resources)

</div>

Pin Save is a decentralized image, video sharing and content aggregation platform where users can not only control the content but also the platform itself.

1. The decentralized feed reinforces the discovery of content and feedback.
2. Decentralized Identity, which provides anonymity and data protection.
3. Upgradeable, resilient, and open decentralized storage.
4. Smart contracts to securely serve web experiences directly to users.

## Features

- Mina, first zk-blockhain, smart contracts

  1. NFTContract to mint and transfer nfts
  2. SwapContract to buy, sell and swap nfts

- Mina Merkle Trees

- NextJS API to obtain adminSignatures

- NextJS API routes save requested data to Vercel Redis Database

  1. Main schema that stores data for a MerkleMap with the same root as on-chain contract.
  2. Pending schema that tracks submitted transactions and promotes the data to main schema.
  3. Admin Signed schema that tracks admin signed data.

- Decentralized feed of NFTs:

![decentralized feed](https://github.com/Pfed-prog/Dspyt-NFTs-EVM/blob/master/assets/feed.png)

- Image posting:

![Upload](https://github.com/Pfed-prog/Dspyt-NFTs-EVM/blob/master/assets/upload.png)

- Comments verified with Auro Wallet:

## Setup

To run this project and start the project in development mode, install it locally using `yarn` and run `yarn dev`:

```bash
yarn
yarn dev
```

## Further Resources

- [PinSave Figma Resources](https://www.figma.com/community/file/1102944149244783025)
- [Pin Save on zkok](https://zkok.io/mina/pin-save/)
- [Npm Pin Save mina package](https://www.npmjs.com/package/pin-mina)
- [EthBucharest 2024: Zero Knowledge proofs on Mina, zkPassport and SoulBound NFTs](https://docs.google.com/presentation/d/1OmJJgzk4iFbKexqBw87oU7oh4H9lXlFFh3eas0EF9y8/edit?usp=sharing)
- [PinSave.app DR](https://ahrefs.com/website-authority-checker/?input=pinsave.app)
