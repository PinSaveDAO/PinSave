import { Button, Center, TextInput, Group } from "@mantine/core";
import React, { useState } from "react";
import {
  Field,
  Mina,
  PrivateKey,
  MerkleMap,
  fetchAccount,
  CircuitString,
  Poseidon,
} from "o1js";
import { useForm } from "@mantine/form";
import { MerkleMapContract } from "pin-mina";

const Home = () => {
  const [wallet, setWallet] = useState("not connected");
  const [hash, setHash] = useState("");

  const form = useForm({
    initialValues: {
      key: "",
      value: "",
    },
  });

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

      const keyToChange = Poseidon.hash(
        CircuitString.fromString(form.values.key).toFields()
      );
      const newValue = Poseidon.hash(
        CircuitString.fromString(form.values.value).toFields()
      );
      let prevValue = Field("");
      if (key === keyToChange) {
        prevValue = key;
      }
      if (key !== keyToChange) {
        map.set(keyToChange, Field(""));
      }
      const witness = map.getWitness(keyToChange);

      const tx = await Mina.transaction(() => {
        zkAppInstance.update(witness, keyToChange, prevValue, newValue);
      });

      await tx.prove();

      const { hash } = await window.mina.sendTransaction({
        transaction: tx.toJSON(),
        feePayer: {
          fee: 1e9,
          memo: "zk",
        },
      });

      form.reset();
      setHash(hash);

      console.log(hash);
    } catch (err) {
      console.log(err?.message);
    }
  }

  return (
    <>
      <Center>address:</Center>
      <Center>{wallet}</Center>

      <form onSubmit={form.onSubmit((values) => console.log(values))}>
        <Center>
          <Group>
            <TextInput
              label="key"
              placeholder=""
              {...form.getInputProps("key")}
            />
            <TextInput
              label="value"
              placeholder=""
              {...form.getInputProps("value")}
            />
          </Group>
        </Center>

        <Center>
          <Button type="submit" onClick={displayWallet} mt={10}>
            Submit new Key-Value
          </Button>
        </Center>
        <Center>{hash}</Center>
      </form>
    </>
  );
};

export default Home;
