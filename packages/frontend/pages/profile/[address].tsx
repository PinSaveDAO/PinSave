import {
  BackgroundImage,
  Box,
  Card,
  Center,
  Group,
  Title,
  Text,
  LoadingOverlay,
  Stack,
} from "@mantine/core";
import { Orbis } from "@orbisclub/orbis-sdk";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import Image from "next/image";

let orbis = new Orbis();

function Post() {
  const router = useRouter();
  const { address } = router.query;
  const [loaded, setLoaded] = useState<boolean>(false);

  //const [user, setUser] = useState<IOrbisProfile | undefined>();
  const [username, setUsername] = useState<string>("New User");
  const [pfp, setPfp] = useState<string>("/PinSaveCard.png");
  const [cover, setCover] = useState<string>("/PinSaveCard.png");
  const [description, setDescription] = useState<string>("");
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);

  useEffect(() => {
    async function loadData() {
      let { data } = await orbis.getDids(address);
      console.log(data);
      if (data[0].address !== undefined) {
        setUsername(data[0].details.profile?.username);
        setPfp(data[0].details.profile?.pfp);

        if (
          typeof data[0].details.profile?.cover === "string" &&
          data[0].details.profile?.cover !== ""
        ) {
          setCover(data[0].details.profile?.cover);
        }

        setDescription(data[0].details.profile?.description);
        setFollowers(data[0].details.count_followers);
        setFollowing(data[0].details.count_following);
        setLoaded(true);
      }
    }

    loadData();
  }, [address]);

  return (
    <>
      {loaded === true ? (
        <Box sx={{ maxWidth: 1200, textAlign: "center" }} mx="auto">
          <BackgroundImage
            src={cover}
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
                  src={pfp}
                  alt={username}
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
                  <Center>
                    <Title mx="auto" order={2}>
                      {username}
                    </Title>
                  </Center>
                  <Center mt={15}>
                    <Text mx="auto">{description}</Text>
                  </Center>
                  <Group mt={10} position="center">
                    <Group position="center" mt="md" mb="xs">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-users"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
                        <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0m-2 14v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2m1 -17.87a4 4 0 0 1 0 7.75m5 10.12v-2a4 4 0 0 0 -3 -3.85"></path>
                      </svg>
                      <Text> Followers: {followers} </Text>
                      <Text> Following: {following} </Text>
                    </Group>
                  </Group>
                </Card>
              </Stack>
            </Center>
          </BackgroundImage>
        </Box>
      ) : (
        <LoadingOverlay visible />
      )}
    </>
  );
}

export default Post;
