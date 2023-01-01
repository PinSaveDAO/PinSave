import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { Orbis } from "@orbisclub/orbis-sdk";
import { Paper, Title, Image } from "@mantine/core";

let orbis = new Orbis();

function Post() {
  const router = useRouter();
  const { address } = router.query;

  const [user, setUser] = useState<any>([]);

  useEffect(() => {
    async function loadData() {
      let res = await orbis.isConnected();

      if (res) {
        let { data, error } = await orbis.getDids(address);
        setUser(data[0]);
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
      {user && user.details ? (
        <Paper
          withBorder
          shadow="xl"
          p="xl"
          radius="xl"
          sx={{ maxWidth: "700px", backgroundColor: "#82c7fc1d" }}
          mx="auto"
        >
          <Title align="center">{user.details.profile?.username}</Title>
          <div style={{ width: 400, marginLeft: "auto", marginRight: "auto" }}>
            <Image
              radius="md"
              mt={10}
              src={user.details.profile?.pfp}
              alt={user.details.profile?.username}
            />
          </div>
        </Paper>
      ) : null}
    </>
  );
}

export default Post;
