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
        "EKFBLaFhnoxqbCCmnVLyutJr5Nhr8Kert8ofpUBt9sSRyRPyjSLP"
      );
      const zkAppAddress = zkAppAddressPrivateKey.toPublicKey();

      const Berkeley = Mina.Network(
        "https://proxy.berkeley.minaexplorer.com/graphql"
      );
      Mina.setActiveInstance(Berkeley);

      // can acess state in app st
      console.log(await fetchAccount({ publicKey: zkAppAddress }));

      const MySmartContractInstance = new MerkleMapContract(zkAppAddress);

      console.log(MySmartContractInstance);

      /*       const tx = await Mina.transaction(() => {
        const YourSmartContractInstance = new MerkleMapContract(zkAppAddress);
        // console.log(YourSmartContractInstance.mapRoot);
        YourSmartContractInstance.initRoot(Field(12333));
      });

      await tx.prove();

      //tx.sign([zkAppAddressPrivateKey]);

      const { hash } = await window.mina.sendTransaction({
        transaction: tx.toJSON(),
        feePayer: {
          fee: "",
          memo: "zk",
        },
      });

      console.log(hash); */
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
