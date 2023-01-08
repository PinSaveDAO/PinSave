import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { Orbis } from "@orbisclub/orbis-sdk";
import { Paper, Title, Image } from "@mantine/core";
import { ethers } from "ethers";
import { ENS } from "@ensdomains/ensjs";

const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/eth"
);

let orbis = new Orbis();
const ENSInstance = new ENS();

function Post() {
  const router = useRouter();
  const { address } = router.query;

  const [user, setUser] = useState<any | undefined>();
  const [ens, setEns] = useState<string | undefined>();

  useEffect(() => {
    async function loadData() {
      let res = await orbis.isConnected();

      if (res) {
        let { data, error } = await orbis.getDids(address);
        setUser(data[0]);
        //console.log(address);
        try {
          const profile = await ENSInstance.withProvider(provider).getProfile(
            //"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
            address as string
          );
          //console.log(profile);
          setEns(profile?.name as any);
        } catch {
          setEns("");
        }
      }

      if (!res) {
        let res = await orbis.connect();
        setUser(res);
      }
    }
    loadData();
  }, [address]);

  return (
    <>
      <Paper
        withBorder
        shadow="xl"
        p="xl"
        radius="xl"
        sx={{ maxWidth: "700px", backgroundColor: "#82c7fc1d" }}
        mx="auto"
      >
        <Title align="center">{user?.details.profile?.username}</Title>
        <Title order={4} align="center">
          {ens}
        </Title>
        <div style={{ width: 400, marginLeft: "auto", marginRight: "auto" }}>
          <Image
            radius="md"
            mt={10}
            src={user?.details.profile?.pfp}
            alt={user?.details.profile?.username}
          />
        </div>
      </Paper>
    </>
  );
}

export default Post;
