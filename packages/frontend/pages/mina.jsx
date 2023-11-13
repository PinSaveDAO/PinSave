import { Box, Button, Center, Loader } from "@mantine/core";
import React, { useState, useEffect } from "react";
import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  MerkleMap,
  PublicKey,
  fetchAccount,
} from "o1js";

import { MerkleMapContract } from "pin-mina";

const Home = () => {
  const [wallet, setWallet] = useState("none");

  async function displayWallet() {
    try {
      // Accounts is an array of string Mina addresses.

      let accounts = await window.mina.requestAccounts();

      // Show first 6 and last 4 characters of user's Mina account.
      setWallet(`${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);

      const zkAppAddressPrivateKey = PrivateKey.fromBase58(
        process.env.NEXT_PUBLIC_APP_KEY
      );

      const zkAppAddress = zkAppAddressPrivateKey.toPublicKey();

      const Berkeley = Mina.Network(
        "https://proxy.berkeley.minaexplorer.com/graphql"
      );

      Mina.setActiveInstance(Berkeley);

      await fetchAccount({ publicKey: zkAppAddress });
      await MerkleMapContract.compile();

      const zkAppInstance = new MerkleMapContract(zkAppAddress);

      const map = new MerkleMap();

      const key = Field(100);
      const value = Field(50);

      map.set(key, value);
      const witness = map.getWitness(key);

      const tx = await Mina.transaction(() => {
        zkAppInstance.update(witness, key, value, Field(5));
      });

      await tx.prove();

      //tx.sign([zkAppAddressPrivateKey]);

      const { hash } = await window.mina.sendTransaction({
        transaction: tx.toJSON(),
        feePayer: {
          fee: 1e9,
          memo: "zk",
        },
      });

      console.log(hash);
    } catch (err) {
      // If the user has a wallet installed but has not created an account, an
      // exception will be thrown. Consider showing "not connected" in your UI.
      console.log(err?.message);
    }
  }

  return (
    <>
      <Button onClick={displayWallet}>Button</Button>
      <Center>{wallet}</Center>
    </>
  );
};

export default Home;
