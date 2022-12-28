import React, { useState, useEffect } from "react";
import { Orbis } from "@orbisclub/orbis-sdk";

import {
  Text,
  Paper,
  Title,
  TextInput,
  Textarea,
  Group,
  Button,
  Image,
  Center,
  Flex,
} from "@mantine/core";

let orbis = new Orbis();

const Upload = () => {
  const [user, setUser] = useState();
  const [username, setUsername] = useState();
  const [pfp, setPfp] = useState();

  useEffect(() => {
    async function ABC() {
      let res = await orbis.isConnected();

      if (res) {
        setUser(res);
      }

      if (!res) {
        let res = await orbis.connect();
        setUser(res);
      }
    }
    ABC();
  }, []);

  async function updateProfile() {
    let res = await orbis.updateProfile({
      pfp: pfp,
      username: username,
    });
  }

  return (
    <>
      <div>
        {user && user.did ? (
          <>
            <Paper
              withBorder
              shadow="xl"
              p="xl"
              radius="xl"
              sx={{ maxWidth: "900px", backgroundColor: "#82c7fc1d" }}
              mx="auto"
            >
              <div
                style={{ width: 400, marginLeft: "auto", marginRight: "auto" }}
              >
                <Center>
                  <Title> {user.details.profile?.username}</Title>
                </Center>
                <Image
                  radius="md"
                  src={user.details.profile?.pfp}
                  alt={user.details.profile?.username}
                />
              </div>

              <TextInput
                my={12}
                size="md"
                label="Change Username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: 300, marginLeft: "auto", marginRight: "auto" }}
              />

              <TextInput
                my={12}
                size="md"
                label="Change Profile Picture"
                placeholder="https://images.app.goo.gl/bHjNNHKxuZYtXyM37"
                value={pfp}
                onChange={(e) => setPfp(e.target.value)}
                style={{ width: 300, marginLeft: "auto", marginRight: "auto" }}
              />
              <Center>
                <Button
                  my={12}
                  size="md"
                  onClick={() => updateProfile()}
                  style={{ marginLeft: "auto", marginRight: "auto" }}
                >
                  Submit
                </Button>
              </Center>
            </Paper>
          </>
        ) : (
          <>Connecting</>
        )}
      </div>
    </>
  );
};

export default Upload;
