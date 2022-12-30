import {
  ActionIcon,
  Paper,
  SimpleGrid,
  Image,
  LoadingOverlay,
  Button,
  TextInput,
} from "@mantine/core";
import React, { useState, useEffect } from "react";

import { ArrowLeft } from "tabler-icons-react";
import { useRouter } from "next/router";

import { usePost } from "@/hooks/api";
import { getCurrentChain } from "@/utils/chains";

import { Orbis } from "@orbisclub/orbis-sdk";

let orbis = new Orbis();

const PostPage = () => {
  const [user, setUser] = useState();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const router = useRouter();
  const currentChain = getCurrentChain(250);
  const { data: post, isLoading } = usePost(
    currentChain,
    router.query.id as string
  );

  const sendMessage = async function () {
    await orbis.createPost({
      body: message,
      context:
        "kjzl6cwe1jw147hcck185xfdlrxq9zv0y0hoa6shzskqfnio56lhf8190yaei7w",
    });
  };

  useEffect(() => {
    async function loadData() {
      let res = await orbis.isConnected();

      if (res) {
        setUser(res);

        /* let { data, error } = await orbis.getProfileGroups(res.did);
        console.log(data); */

        /* let { data, error } = await orbis.getGroup(
          "kjzl6cwe1jw147hcck185xfdlrxq9zv0y0hoa6shzskqfnio56lhf8190yaei7w"
        ); */

        let result = await orbis.getPosts({
          context:
            "kjzl6cwe1jw147hcck185xfdlrxq9zv0y0hoa6shzskqfnio56lhf8190yaei7w",
        });

        setMessages(result.data);

        /* let { data, error } = await orbis.getChannel(
          "kjzl6cwe1jw147hcck185xfdlrxq9zv0y0hoa6shzskqfnio56lhf8190yaei7w"
        ); */

        console.log(result.data);

        /* await orbis.updateGroup(
          "kjzl6cwe1jw147hcck185xfdlrxq9zv0y0hoa6shzskqfnio56lhf8190yaei7w",
          {
            pfp: "https://evm.pinsave.app/PinSaveL.png",
            name: "Pin Save",
            description: "decentralised Pinterest",
          }
        ); */

        //"kjzl6cwe1jw14ai2gg8e0qmx2j944ppe3s3dgfk003jlb8guuybyg4m77nsrg73"
        /* await orbis.createChannel(
          "kjzl6cwe1jw147hcck185xfdlrxq9zv0y0hoa6shzskqfnio56lhf8190yaei7w",
          {
            group_id:
              "kjzl6cwe1jw147hcck185xfdlrxq9zv0y0hoa6shzskqfnio56lhf8190yaei7w",
            pfp: "https://evm.pinsave.app/PinSaveL.png",
            name: "Pin Save",
            description: "decentralised Pinterest",
          }
        ); */
      }

      if (!res) {
        let res = await orbis.connect();
        setUser(res);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <LoadingOverlay visible={isLoading} />
      {post && (
        <>
          <ActionIcon
            onClick={() => router.back()}
            mb="md"
            color="teal"
            size="xl"
            radius="xl"
            variant="filled"
          >
            <ArrowLeft />
          </ActionIcon>
          <SimpleGrid
            breakpoints={[
              { minWidth: "md", cols: 2, spacing: "lg" },
              { maxWidth: "md", cols: 1, spacing: "md" },
            ]}
          >
            <Image
              height={550}
              fit="contain"
              src={post.image ?? "https://evm.pinsave.app/PinSaveCard.png"}
              alt={post.name}
            />
            <Paper shadow="sm" p="md" withBorder>
              <h2 style={{ marginBottom: "1.4rem" }}>{post.name}</h2>
              <Paper
                shadow="xs"
                withBorder
                px="sm"
                sx={{ backgroundColor: "#82c7fc1d" }}
              >
                <p>{post.description}</p>
              </Paper>
              <p style={{ fontSize: "small", color: "#0000008d" }}>
                Owned by:{" "}
                <a
                  style={{ color: "#198b6eb9" }}
                  href={`https://evm.pinsave.app/profile/${post.owner}`}
                >
                  {post.owner}
                </a>
              </p>

              {messages &&
                messages.map((post: any, i: number) => (
                  <Paper
                    shadow="xs"
                    withBorder
                    px="sm"
                    sx={{ backgroundColor: "#80c7fc1d" }}
                  >
                    <p key={i}>{post.content.body}</p>
                  </Paper>
                ))}

              <TextInput
                my="lg"
                required
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                label="Message"
                placeholder="Enter your message"
                sx={{ maxWidth: "240px" }}
              />
              <Button
                component="a"
                radius="lg"
                mt="md"
                onClick={() => sendMessage()}
              >
                Upload Post
              </Button>
            </Paper>
          </SimpleGrid>
        </>
      )}
    </div>
  );
};

export default PostPage;
