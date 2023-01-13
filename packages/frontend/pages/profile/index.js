import React, { useState, useEffect } from "react";
import { Orbis } from "@orbisclub/orbis-sdk";
import {
  Paper,
  Title,
  TextInput,
  Button,
  Image,
  Center,
  LoadingOverlay,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { showNotification, updateNotification } from "@mantine/notifications";
import { NFTStorage } from "nft.storage";

import { dropzoneChildren } from "@/components/UploadForm";

let orbis = new Orbis();

const Upload = () => {
  const [image, setImage] = useState();

  const [user, setUser] = useState();
  const [username, setUsername] = useState();
  const [pfp, setPfp] = useState();

  useEffect(() => {
    async function loadData() {
      let res = await orbis.isConnected();

      if (res) {
        setUser(res);
      }

      if (!res) {
        let res = await orbis.connect();
        setUser(res);
      }
    }
    loadData();
  }, [user]);

  async function updateProfile() {
    showNotification({
      id: "upload-post",
      loading: true,
      title: "Uploading post",
      message: "Data will be loaded in a couple of seconds",
      autoClose: false,
      disallowClose: true,
    });

    if (image) {
      const client = new NFTStorage({
        token: process.env.NEXT_PUBLIC_TOKEN ?? "",
      });

      const cid = await client.storeBlob(new Blob([image]));

      await orbis.updateProfile({
        username: username ?? user.details.profile?.username,
        pfp: "https://" + cid + ".ipfs.nftstorage.link",
      });

      updateNotification({
        id: "upload-post",
        color: "teal",
        title: "Profile uploaded successfully!!",
        message: "PFP:" + "https://" + cid + ".ipfs.nftstorage.link",
      });

      return;
    }

    await orbis.updateProfile({
      username: username ?? user.details.profile?.username,
      pfp: pfp ?? user.details.profile?.pfp,
    });

    updateNotification({
      id: "upload-post",
      color: "teal",
      title: "Profile uploaded successfully!!",
      message: "",
    });
  }

  async function logout() {
    setUser("");
    await orbis.logout();
  }

  return (
    <>
      {user && user.did ? (
        <>
          <Paper
            withBorder
            shadow="xl"
            p="md"
            radius="lg"
            sx={{ maxWidth: "700px", backgroundColor: "#82c7fc1d" }}
            mx="auto"
          >
            <Button
              my={12}
              size="sm"
              onClick={() => logout()}
              style={{
                float: "right",
              }}
            >
              Log Out
            </Button>
            <div
              style={{ width: 450, marginLeft: "auto", marginRight: "auto" }}
            >
              <Center>
                <Title> {user.details.profile?.username} </Title>
              </Center>
              <Image
                radius="md"
                mt={10}
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
              label="Change Profile Picture from URL"
              placeholder="https://images.app.goo.gl/bHjNNHKxuZYtXyM37"
              value={pfp}
              onChange={(e) => setPfp(e.target.value)}
              style={{ width: 300, marginLeft: "auto", marginRight: "auto" }}
            />
            <Dropzone
              mt="md"
              ml="xl"
              mr="xl"
              onReject={(files) => console.log("rejected files", files)}
              onDrop={(files) => setImage(files[0])}
              maxSize={25000000}
              multiple={false}
              accept={[
                MIME_TYPES.png,
                MIME_TYPES.jpeg,
                MIME_TYPES.webp,
                MIME_TYPES.svg,
                MIME_TYPES.gif,
              ]}
            >
              {() => dropzoneChildren(image)}
            </Dropzone>

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
        <LoadingOverlay visible />
      )}
    </>
  );
};

export default Upload;
