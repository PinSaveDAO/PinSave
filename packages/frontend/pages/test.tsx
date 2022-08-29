import type { NextPage } from "next";
import { useState } from "react";
import "isomorphic-fetch";

const Upload: NextPage = () => {
  const [value, setValue] = useState("");
  const [profileData, setProfileData] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    fetchProfile(value);
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
    </>
  );
};

export default Upload;
