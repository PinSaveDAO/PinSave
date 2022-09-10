<p align="center">
  <img src="https://raw.githubusercontent.com/Pfed-prog/Dspyt-NFTs-EVM/master/packages/frontend/public/PinSaveL.png" alt="Size Limit CLI" width="738" >
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
- [Lukso Api](#lukso-api)

## Setup

To run this project and start the project in development mode, install it locally using yarn and run yarn frontend:dev:

```
$ yarn
$ yarn frontend:dev
```

## Lukso Api

The API support both l14 and l16 testnet Lukso Chains.

- Endpoint to Display controllers and permissions for the Universal Profile:

  https://evm.pinsave.app/api/lukso/{chain}/controllers/{address}

  chain takes arguments: l14 or l16

Example:
https://evm.pinsave.app/api/lukso/l14/controllers/0xcC4E089687849a02Eb2D9Ec2da55BE394137CCc7

Response:

```json
{
  "data": [
    {
      "CHANGEOWNER": true,
      "CHANGEPERMISSIONS": true,
      "ADDPERMISSIONS": true,
      "SETDATA": true,
      "CALL": true,
      "STATICCALL": true,
      "DELEGATECALL": false,
      "DEPLOY": true,
      "TRANSFERVALUE": true,
      "SIGN": true,
      "SUPER_SETDATA": true,
      "SUPER_TRANSFERVALUE": true,
      "SUPER_CALL": true,
      "SUPER_STATICCALL": true,
      "SUPER_DELEGATECALL": false,
      "address": "0x2679bbb9233016c7cAAcB480FBc77dEeDDf8c006"
    },
    {
      "CHANGEOWNER": false,
      "CHANGEPERMISSIONS": false,
      "ADDPERMISSIONS": false,
      "SETDATA": true,
      "CALL": false,
      "STATICCALL": false,
      "DELEGATECALL": false,
      "DEPLOY": false,
      "TRANSFERVALUE": false,
      "SIGN": false,
      "SUPER_SETDATA": false,
      "SUPER_TRANSFERVALUE": false,
      "SUPER_CALL": false,
      "SUPER_STATICCALL": false,
      "SUPER_DELEGATECALL": false,
      "address": "0xe5089Aaa677501BeC72d5418d476850d83e5b750"
    }
  ]
}
```

- Endpoint to create Universal profile with a provided controller address.

  http://localhost:3000/api/lukso/{chain}/create/{controller}

You can provide Data for the universal profile in the body of the post request

Currently Vercel Times Out the Request. [StackOverflow](https://stackoverflow.com/questions/68276674/vercel-serverless-function-has-timed-out-error)

Example:
https://evm.pinsave.app/api/lukso/l14/create/0x2679bbb9233016c7cAAcB480FBc77dEeDDf8c006

Response:

```json
{
  "Deployed": {
    "LSP0ERC725Account": {
      "address": "0x3516aDC852fDe17F320F7D2A7990B588084Ed9b0",
      "receipt": {
        "to": null,
        "from": "0xca0B485A59B42a29df5aFA9fF9422FF9C6d7Eea4",
        "contractAddress": "0x3516aDC852fDe17F320F7D2A7990B588084Ed9b0",
        "transactionIndex": 0,
        "gasUsed": { "type": "BigNumber", "hex": "0x01066b" },
        "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "blockHash": "0x1907e86b1cb0ae67d22f70049f0825a0003f163a5b67dbd22590ab21c680bae3",
        "transactionHash": "0xf562907a1931d6e2119e60f999ebc89bb42d16676514db85705a63583e758fb5",
        "logs": [],
        "blockNumber": 15218296,
        "confirmations": 1,
        "cumulativeGasUsed": { "type": "BigNumber", "hex": "0x01066b" },
        "status": 1,
        "type": 0,
        "byzantium": true,
        "events": []
      }
    },
    "LSP6KeyManager": {
      "address": "0xcA68Bd6e9b2C4fB98daf45A3Cd50FdfF4BCD19F9",
      "receipt": {
        "to": null,
        "from": "0xca0B485A59B42a29df5aFA9fF9422FF9C6d7Eea4",
        "contractAddress": "0xcA68Bd6e9b2C4fB98daf45A3Cd50FdfF4BCD19F9",
        "transactionIndex": 0,
        "gasUsed": { "type": "BigNumber", "hex": "0x0100eb" },
        "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "blockHash": "0x43607b2fb532ac10027b8bccee1135fadc62f5ea88baf282d75775ecbe6e3841",
        "transactionHash": "0x08501a75306328dce82e6213761ec8b2c452ce503a323e41cdeb12e9af405dff",
        "logs": [],
        "blockNumber": 15218298,
        "confirmations": 1,
        "cumulativeGasUsed": { "type": "BigNumber", "hex": "0x0100eb" },
        "status": 1,
        "type": 0,
        "byzantium": true,
        "events": []
      }
    }
  }
}
```

- Query Universal Profile:
  https://evm.pinsave.app/api/lukso/{chain}/{address}

Example:
http://evm.pinsave.app/api/lukso/l14/0xcC4E089687849a02Eb2D9Ec2da55BE394137CCc7

Response:

```json
{
  "ProfileData": [
    {
      "key": "0xeafec4d89fa9619884b60000abe425d64acd861a49b8ddf5c0b6962110481f38",
      "name": "SupportedStandards:LSP3UniversalProfile",
      "value": "0xabe425d6"
    },
    {
      "key": "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
      "name": "LSP3Profile",
      "value": {
        "LSP3Profile": {
          "name": "My Universal Profile",
          "description": "My Cool Universal Profile",
          "tags": ["Public Profile"],
          "links": [{ "title": "My Website", "url": "https://my.com" }]
        }
      }
    },
    {
      "key": "0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd",
      "name": "LSP12IssuedAssets[]",
      "value": []
    },
    {
      "key": "0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b",
      "name": "LSP5ReceivedAssets[]",
      "value": ["0x9c49Ebc7F0da23F71D7d0e73c0885694EA05492A"]
    },
    {
      "key": "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47",
      "name": "LSP1UniversalReceiverDelegate",
      "value": "0xe5089Aaa677501BeC72d5418d476850d83e5b750"
    }
  ]
}
```
