import type { NextPage } from "next";
import { useState } from "react";
import "isomorphic-fetch";
import Web3 from "web3";
import { useAccount } from "wagmi";

import { transferLXY } from "../utils/lukso/KeyManager";

const Upload: NextPage = () => {
  const [value, setValue] = useState("");
  const [profileData, setProfileData] = useState("");

  const { address } = useAccount();
  const web3 = new Web3("https://rpc.l14.lukso.network");

  async function Bla(address: string) {
    const balance = await web3.eth.getBalance(address);
    console.log(web3.utils.fromWei(balance));
  }

  if (address) {
    Bla(address);
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();
    fetchProfile(value);
  };

  const transfer = async () => {
    try {
      const transaction = await transferLXY(
        "0xcC4E089687849a02Eb2D9Ec2da55BE394137CCc7",
        "0xC5092FDd9E95297bF74F767Ad40f60D70b308A3b",
        "3",
        web3
      );
      console.log(transaction);
    } catch (error: any) {
      console.error(error);
    }
  };

  async function fetchProfile(address: string) {
    try {
      const profileData = await fetch(`/api/lukso/l16/${address}`);
      console.log(await profileData.json());
      const initialState = {
        firstName: "Name",
      };
      const profileData1 = await fetch("/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(initialState),
      });
      console.log(await profileData1.json());

      const strprofileData = JSON.stringify(profileData, undefined, 2);
      setProfileData(strprofileData);
    } catch (error) {
      return console.log("This is not an ERC725 Contract", error);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input onChange={(e) => setValue(e.target.value)} value={value}></input>
        <button type="submit">Inspect the Address</button>
      </form>
      <p>{profileData}</p>
      <div className="mt-5">
        <a
          type="button"
          className="inline-flex justify-center w-full px-4 py-2 sm:col-start-2 sm:text-sm"
          onClick={transfer}
        >
          Transfer
        </a>
      </div>
    </>
  );
};

export default Upload;
