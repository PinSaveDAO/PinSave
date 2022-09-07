<p align="center">
  <img src="https://github.com/Pfed-prog/Dspyt-NFTs-EVM/blob/master/packages/frontend/public/PinSaveL.png?raw=true" alt="Size Limit CLI" width="738" >
</p>

<p align="center">
    <a href="https://discord.gg/NTn6MZqk">
        <img src="https://img.shields.io/discord/915204325771444234?style=flat-square"
            alt="chat on Discord"></a>
    <a href="https://twitter.com/intent/follow?screen_name=pinsav3">
        <img src="https://img.shields.io/twitter/follow/pinsav3?style=social"
            alt="follow on Twitter"></a>
</p>

Pin Save is a decentralized image sharing and content aggregation platform where users can not only control the content, but also the platform itself.

Pin Save 4 key features:

1. The decentralized Feed to reinforce discovery of content and feedback.
2. Decentralized Identity (ERC-725) to provide anonymity and data protection.
3. Upgradeable, resilient, and more open decentralized storage.
4. Smart Contracts to securely serve web experiences directly to users.

## Table of contents

- [Setup](#Setup)
- [Lukso Api](#Lukso)

## Setup

To run this project and start the project in development mode, install it locally using yarn and run yarn frontend:dev:

```
$ yarn
$ yarn frontend:dev
```

## Lukso Api

- Endpoint to Dsiplay controllers and permissions:
  https://dspyt.com/api/lukso/{chain}/controllers/{address}

Example:
https://dspyt.com/api/lukso/l14/controllers/0xcC4E089687849a02Eb2D9Ec2da55BE394137CCc7

Output:

```
{"data":[{"CHANGEOWNER":true,"CHANGEPERMISSIONS":true,"ADDPERMISSIONS":true,"SETDATA":true,"CALL":true,"STATICCALL":true,"DELEGATECALL":false,"DEPLOY":true,"TRANSFERVALUE":true,"SIGN":true,"SUPER_SETDATA":true,"SUPER_TRANSFERVALUE":true,"SUPER_CALL":true,"SUPER_STATICCALL":true,"SUPER_DELEGATECALL":false,"address":"0x2679bbb9233016c7cAAcB480FBc77dEeDDf8c006"},{"CHANGEOWNER":false,"CHANGEPERMISSIONS":false,"ADDPERMISSIONS":false,"SETDATA":true,"CALL":false,"STATICCALL":false,"DELEGATECALL":false,"DEPLOY":false,"TRANSFERVALUE":false,"SIGN":false,"SUPER_SETDATA":false,"SUPER_TRANSFERVALUE":false,"SUPER_CALL":false,"SUPER_STATICCALL":false,"SUPER_DELEGATECALL":false,"address":"0xe5089Aaa677501BeC72d5418d476850d83e5b750"}]}
```
