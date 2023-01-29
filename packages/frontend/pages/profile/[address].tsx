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
import { Orbis } from "@orbisclub/orbis-sdk";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

let orbis = new Orbis();

function Post() {
  const router = useRouter();
  const { address } = router.query;

  const [user, setUser] = useState<IOrbisProfile | undefined>();
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
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0m-2 14v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2m1 -17.87a4 4 0 0 1 0 7.75m5 10.12v-2a4 4 0 0 0 -3 -3.85"></path>
                    </svg>
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
