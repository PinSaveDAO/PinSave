import React, { useState, useEffect } from "react";
import { Orbis } from "@orbisclub/orbis-sdk";
// import fetchJson, { FetchError } from "utils/fetchJson";

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
  MediaQuery,
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
        {user?.did ? (
          <>
            <p>Connected with: {user.did}</p>
            <TextInput
              label="Username"
              placeholder="Username Title"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextInput
              label="PFP"
              placeholder="https://images.app.goo.gl/bHjNNHKxuZYtXyM37"
              value={pfp}
              onChange={(e) => setPfp(e.target.value)}
            />
            <Button onClick={() => updateProfile()}>Submit</Button>
          </>
        ) : (
          <>Connecting</>
        )}
      </div>
    </>
  );
};

export default Upload;
