import React, { useState, useEffect } from "react";
import { Orbis } from "@orbisclub/orbis-sdk";
import { IconUsers, IconHeart } from "@tabler/icons";

import {
  BackgroundImage,
  Box,
  Button,
  Card,
  Center,
  Container,
  Group,
  Image,
  Paper,
  Title,
  Text,
  TextInput,
  LoadingOverlay,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { showNotification, updateNotification } from "@mantine/notifications";
import { NFTStorage } from "nft.storage";

import { dropzoneChildren } from "@/components/UploadForm";

let orbis = new Orbis();

const Upload = () => {
  const [cover, setCover] = useState<string>();
  const [image, setImage] = useState<File | undefined>();
  const [description, setDescription] = useState<string>();
  const [user, setUser] = useState<IOrbisProfile>();
  const [followers, setFollowers] = useState<number>();
  const [username, setUsername] = useState<string>();
  const [pfp, setPfp] = useState<string>();

  useEffect(() => {
    async function loadData() {
      let res = await orbis.isConnected();

      if (!res) {
        res = await orbis.connect();
      }
      setUser(res);
      console.log(res);
      /*       setCover(res.details.profile.cover);
      setDescription(res.details.description);
      setFollowers(res.details.count_followers); */
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
        username: username ?? user?.details.profile?.username,
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
      username: username ?? user?.details.profile?.username,
      pfp: pfp ?? user?.details.profile?.pfp,
    });

    updateNotification({
      id: "upload-post",
      color: "teal",
      title: "Profile uploaded successfully!!",
      message: "",
    });
  }

  async function logout() {
    setUser(undefined);
    await orbis.logout();
  }

  return (
    <>
      {user && user.did ? (
        <>
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
          <Box sx={{ maxWidth: 1200 }} mx="auto">
            <BackgroundImage
              src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80"
              radius="xs"
              style={{
                height: 500,
                marginBottom: "25px",
              }}
            >
              <Image
                radius="md"
                src={user.details.profile?.pfp}
                alt={user.details.profile?.username}
                mx="auto"
                style={{
                  width: 300,
                  height: 300,
                  paddingTop: 50,
                }}
              />

              <Card
                shadow="sm"
                p="lg"
                radius="lg"
                withBorder
                mx="auto"
                style={{
                  maxWidth: 400,
                }}
              >
                <Center>
                  <Title order={2}> {user.details.profile?.username} </Title>
                </Center>
                <Group mt={25} position="center">
                  <Group position="center" mt="md" mb="xs">
                    <IconUsers size={26} />
                    <Text> {user.details.count_followers} </Text>
                  </Group>
                  <Container size={100}>
                    <IconHeart size={20} />
                  </Container>
                </Group>
              </Card>
            </BackgroundImage>
          </Box>
          <Paper
            shadow="xl"
            p="md"
            radius="lg"
            sx={{ maxWidth: "700px", backgroundColor: "#82c7fc1d" }}
            mx="auto"
          >
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
