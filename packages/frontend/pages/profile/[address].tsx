import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { Orbis } from "@orbisclub/orbis-sdk";
import { IconUsers } from "@tabler/icons";
import {
  BackgroundImage,
  Box,
  Card,
  Center,
  Group,
  Image,
  Title,
  Text,
  LoadingOverlay,
  Stack,
} from "@mantine/core";
import { ethers } from "ethers";

let orbis = new Orbis();

function Post() {
  const router = useRouter();
  const { address } = router.query;

  const [user, setUser] = useState<any | undefined>();
  const [ens, setEns] = useState<string | undefined>("");

  useEffect(() => {
    async function loadData() {
      let res = await orbis.isConnected();

      if (res) {
        let { data } = await orbis.getDids(address);
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
      {user || ens ? (
        <Box sx={{ maxWidth: 1200 }} mx="auto">
          <BackgroundImage
            src={
              user?.details.profile?.cover ??
              "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80"
            }
            radius="xs"
            style={{
              height: 500,
              marginBottom: "25px",
            }}
          >
            <Stack
              spacing="xs"
              sx={{
                height: 400,
              }}
            >
              <Image
                radius="md"
                src={user?.details.profile?.pfp}
                alt={user?.details.profile?.username}
                mx="auto"
                style={{
                  width: 300,
                  height: 300,
                  paddingTop: 50,
                  paddingBottom: 40,
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
                <Center>
                  <Title mx="auto" order={2}>
                    {user?.details.profile?.username} {ens}
                  </Title>
                </Center>
                <Center mt={15}>
                  <Text mx="auto"> {user?.details.profile?.description} </Text>
                </Center>
                <Group mt={10} position="center">
                  <Group position="center" mt="md" mb="xs">
                    <IconUsers size={26} />
                    <Text> Followers: {user?.details.count_followers} </Text>
                    <Text> Following: {user?.details.count_following} </Text>
                  </Group>
                </Group>
              </Card>
            </Stack>
          </BackgroundImage>
        </Box>
      ) : (
        <LoadingOverlay visible />
      )}
    </>
  );
}

export default Post;
