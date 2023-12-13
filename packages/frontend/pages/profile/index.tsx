import { dropzoneChildren } from "@/components/UploadForm";
import {
  BackgroundImage,
  Box,
  Button,
  Card,
  Center,
  Group,
  Paper,
  Title,
  Text,
  TextInput,
  Stack,
} from "@mantine/core";
import Image from "next/image";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { showNotification, updateNotification } from "@mantine/notifications";
import { Orbis } from "@orbisclub/orbis-sdk";
import { NFTStorage } from "nft.storage";
import { useAccount } from "wagmi";
import React, { useState, useEffect } from "react";

let orbis = new Orbis();

const Upload = () => {
  const [cover, setCover] = useState<File | undefined>();
  const [image, setImage] = useState<File | undefined>();
  const [description, setDescription] = useState<string>();
  const [user, setUser] = useState<IOrbisProfile>();
  const [username, setUsername] = useState<string>();

  const [orbisLogoutState, setOrbisLogoutState] = useState<boolean>(false);

  const { isConnected, connector } = useAccount();

  useEffect(() => {
    async function loadData() {
      if (isConnected) {
        const provider = await connector?.getProvider();

        let res = await orbis.isConnected();

        if (!res) {
          res = await orbis.connect_v2({
            chain: "ethereum",
            provider: provider,
            lit: false,
          });
        }
        setUser(res);
      }
    }

    async function orbisLogout() {
      await orbis.logout();
    }
    if (!orbisLogoutState) {
      loadData();
    }
    if (orbisLogoutState) {
      orbisLogout();
    }
  }, [orbisLogoutState]);

  async function updateProfile() {
    showNotification({
      id: "upload-post",
      loading: true,
      title: "Uploading Data",
      message: "Data will be loaded in a couple of seconds",
      autoClose: false,
      disallowClose: true,
    });

    if (image || cover) {
      let cidPfp, cidCover;

      const client = new NFTStorage({
        token: process.env.NEXT_PUBLIC_TOKEN,
      });

      if (image) {
        cidPfp = await client.storeBlob(new Blob([image]));
        cidPfp = "https://" + cidPfp + ".ipfs.nftstorage.link";
      }

      if (cover) {
        cidCover = await client.storeBlob(new Blob([cover]));
        cidCover = "https://" + cidCover + ".ipfs.nftstorage.link";
      }

      await orbis.updateProfile({
        username: username ?? user?.details.profile?.username,
        pfp: cidPfp ?? user?.details.profile?.pfp ?? "",
        cover: cidCover ?? user?.details.profile?.cover ?? "",
        description: description ?? user?.details.profile?.description ?? "",
      });

      updateNotification({
        id: "upload-post",
        color: "teal",
        title: "Profile uploaded successfully!!",
        message: "File uploaded successfully ",
      });

      return;
    }

    await orbis.updateProfile({
      username: username ?? user?.details.profile?.username ?? "",
      pfp: user?.details.profile?.pfp ?? "",
      cover: user?.details.profile?.cover ?? "",
      description: description ?? user?.details.profile?.description ?? "",
    });

    updateNotification({
      id: "upload-post",
      color: "teal",
      title: "Profile uploaded successfully!!",
      message: "",
    });
  }

  /*   async function syncProfile() {
    if (walletClient && universalProfile) {
      await UpdateProfile({
        address: universalProfile,
        name: user?.details.profile?.username,
        description: user?.details.profile?.description,
        profileImage: user?.details.profile?.pfp,
        backgroundImage: user?.details.profile?.cover,
      });
    }
  } */

  /*   async function createProfile() {
    if (walletClient && address) {
      const deployedERC725 = await CreateProfile({
        signer: walletClient,
        address: address,
      });
      setUniversalProfile(deployedERC725);
    }
  } */

  async function logout() {
    setUser(undefined);
    setOrbisLogoutState(true);
  }

  return (
    <>
      {isConnected && user?.did ? (
        <>
          <Box sx={{ maxWidth: 1200, textAlign: "center" }} mx="auto">
            <BackgroundImage
              src={
                typeof user.details.profile?.cover === "string" &&
                user.details.profile?.cover !== ""
                  ? user.details.profile?.cover
                  : "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80"
              }
              radius="xs"
              style={{
                height: "auto",
                borderRadius: "10px",
              }}
            >
              <Center>
                <Stack
                  spacing="xs"
                  sx={{
                    height: 400,
                  }}
                >
                  <Image
                    height={600}
                    width={550}
                    src={user.details.profile?.pfp ?? "/PinSaveCard.png"}
                    alt={user.details.profile?.username ?? "user"}
                    style={{
                      width: "auto",
                      height: "50%",
                      borderRadius: "10px",
                      marginTop: "10px",
                    }}
                  />

                  <Card
                    shadow="sm"
                    p="lg"
                    radius="lg"
                    withBorder
                    mx="auto"
                    style={{
                      minWidth: 400,
                      minHeight: 200,
                    }}
                  >
                    <Title mx="auto" order={2} align="center">
                      {user.details.profile?.username}
                    </Title>
                    <Text mt={15} mx="auto" align="center">
                      {user.details.profile?.description}
                    </Text>
                    <Group mt={10} position="center">
                      <Group position="center" mt="md" mb="xs">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon icon-tabler icon-tabler-users"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          fill="none"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0m-2 14v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2m1 -17.87a4 4 0 0 1 0 7.75m5 10.12v-2a4 4 0 0 0 -3 -3.85" />
                        </svg>
                        <Text> Followers: {user.details.count_followers} </Text>
                        <Text> Following: {user.details.count_following} </Text>
                        <Button
                          my={2}
                          size="sm"
                          color="red"
                          onClick={() => logout()}
                          style={{
                            zIndex: 1,
                          }}
                        >
                          Log Out
                        </Button>
                      </Group>
                    </Group>
                  </Card>
                </Stack>
              </Center>
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
              onChange={(e) => setUsername(e.target.value as `0x${string}`)}
              mx="auto"
              style={{
                width: 300,
                textAlign: "center",
                WebkitBackgroundClip: "text",
              }}
              sx={{
                background: "green",
              }}
            />
            <TextInput
              my={12}
              size="md"
              label="Change Description"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              mx="auto"
              style={{
                width: 300,
                textAlign: "center",
                WebkitBackgroundClip: "text",
              }}
              sx={{
                background: "green",
              }}
            />
            <Title
              mt={20}
              order={2}
              align="center"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              sx={(theme) => ({
                background: theme.fn.radialGradient("green", "white"),
              })}
            >
              Upload PFP
            </Title>
            <Center>
              <Dropzone
                mt="md"
                ml="xl"
                mr="xl"
                onReject={(files) => console.log("rejected files", files)}
                onDrop={(files) => setImage(files[0])}
                maxSize={25000000}
                multiple={false}
                sx={{ maxWidth: 500, maxHeight: 250, marginBottom: "1rem" }}
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
            </Center>
            <Title
              mt={20}
              order={2}
              align="center"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              sx={(theme) => ({
                background: theme.fn.radialGradient("green", "white"),
              })}
            >
              Upload Cover
            </Title>
            <Center>
              <Dropzone
                mt="md"
                ml="xl"
                mr="xl"
                onReject={(files) => console.log("rejected files", files)}
                onDrop={(files) => setCover(files[0])}
                maxSize={25000000}
                multiple={false}
                sx={{ maxWidth: 500, maxHeight: 250, marginBottom: "3rem" }}
                accept={[
                  MIME_TYPES.png,
                  MIME_TYPES.jpeg,
                  MIME_TYPES.webp,
                  MIME_TYPES.svg,
                  MIME_TYPES.gif,
                ]}
              >
                {() => dropzoneChildren(cover)}
              </Dropzone>
            </Center>
            <Center>
              <Button
                my={12}
                mt={20}
                size="md"
                onClick={() => updateProfile()}
                mx="auto"
              >
                Submit
              </Button>
            </Center>

            {/*
              <TextInput
              my={12}
              size="md"
              label="Universal Profile"
              placeholder="address"
              value={universalProfile}
              onChange={(e) =>
                setUniversalProfile(e.target.value as `0x${string}`)
              }
              mx="auto"
              style={{
                width: 300,
                textAlign: "center",
                WebkitBackgroundClip: "text",
              }}
              sx={{
                background: "green",
              }}
            />
               <Button
                my={12}
                mt={20}
                size="md"
                onClick={() => syncProfile()}
                mx="auto"
              >
                Sync
              </Button>
              <Button
                my={12}
                mt={20}
                size="md"
                onClick={() => createProfile()}
                mx="auto"
              >
                Create Profile
              </Button>
            */}
          </Paper>
        </>
      ) : null}
      {!isConnected ? (
        <Text> Connect to wallet to edit your profile</Text>
      ) : null}
    </>
  );
};

export default Upload;
