import React from "react";
import ReactDOM from "react-dom";
import { Contract, connect, keyStores, WalletConnection } from "near-api-js";

import "./index.scss";
import App from "./App";
import getConfig from "./config.js";


// Initializing contract
async function initContract() {
  // get network configuration values from config.js
  // based on the network ID we pass to getConfig()
  const nearConfig = getConfig(process.env.NEAR_ENV || "testnet");

  // create a keyStore for signing transactions using the user's key
  // which is located in the browser local storage after user logs in
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();

  // Initializing connection to the NEAR testnet
  const near = await connect({ keyStore, ...nearConfig });

  // Initialize wallet connection
  const walletConnection = new WalletConnection(near);

  // Load in user's account data
  let currentUser;
  if (walletConnection.getAccountId()) {
    currentUser = {
      // Gets the accountId as a string
      accountId: walletConnection.getAccountId(),
      // Gets the user's token balance
      balance: (await walletConnection.account().state()).amount,
    };
  }

  // Initializing our contract APIs by contract name and configuration
  const contract = new Contract(
    // User's accountId as a string
    walletConnection.account(),
    // accountId of the contract we will be loading
    // NOTE: All contracts on NEAR are deployed to an account and
    // accounts can only have one contract deployed to them.
    nearConfig.contractName,
    {
      // View methods are read-only – they don't modify the state, but usually return some value
      viewMethods: ["nft_total_supply", "nft_supply_for_owner", "nft_tokens","nft_token"],
      // Change methods can modify the state, but you don't receive the returned value when called
      changeMethods: ["nft_mint"],
      // Sender is the account ID to initialize transactions.
      // getAccountId() will return empty string if user is still unauthorized
      sender: walletConnection.getAccountId(),
    }
  );

  //return { contract, currentUser, nearConfig, walletConnection };

  const didContract = new Contract(walletConnection.account(), 'dids.vitalpointai.testnet', {
    viewMethods: ['getDID', 'hasDID', 'findAlias', 'getAliases', 'getDefinitions'],
    changeMethods: []
  })

  return { contract, currentUser, nearConfig, walletConnection, didContract };

}

initContract().then(
  ({ contract, currentUser, nearConfig, walletConnection, didContract }) => {
    ReactDOM.render(
      <React.StrictMode>
        <App
          contract={contract}
          currentUser={currentUser}
          nearConfig={nearConfig}
          wallet={walletConnection}
          didContract={didContract}
        />
      </React.StrictMode>,

      document.getElementById("root")
    );
  }
);
