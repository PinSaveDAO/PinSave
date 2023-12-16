import { useProfile } from "@/hooks/api";

import {
  BackgroundImage,
  Box,
  Card,
  Center,
  Group,
  Title,
  Text,
  Stack,
  LoadingOverlay,
} from "@mantine/core";
import { useRouter } from "next/router";

import Image from "next/image";

function Post() {
  const router = useRouter();
  const { address } = router.query;

  const { data: profileQueried, isLoading } = useProfile(String(address));

  return (
    <>
      {profileQueried ? (
        <Box sx={{ maxWidth: 1200, textAlign: "center" }} mx="auto">
          <BackgroundImage
            src={profileQueried.cover}
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
                  src={profileQueried.pfp}
                  alt={profileQueried.username}
                  unoptimized={true}
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
                      {profileQueried.username}
                    </Title>
                  </Center>
                  <Center mt={15}>
                    <Text mx="auto">{profileQueried.description}</Text>
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
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0m-2 14v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2m1 -17.87a4 4 0 0 1 0 7.75m5 10.12v-2a4 4 0 0 0 -3 -3.85"></path>
                      </svg>
                      <Text> Followers: {profileQueried.followers} </Text>
                      <Text> Following: {profileQueried.following} </Text>
                    </Group>
                  </Group>
                </Card>
              </Stack>
            </Center>
          </BackgroundImage>
        </Box>
      ) : (
        <LoadingOverlay visible={isLoading} />
      )}
    </>
  );
}

export default Post;
