import {
  ActionIcon,
  Paper,
  SimpleGrid,
  Image,
  LoadingOverlay,
  Button,
  TextInput,
  Text,
  Group,
  Avatar,
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
      tags: [{ slug: router.query.id, title: router.query.id }],
    });
  };

  function timeConverter(UNIX_timestamp: number) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time =
      date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
    return time;
  }

  const sendReaction = async function (id: string, reaction: string) {
    await orbis.react(id, reaction);
  };

  useEffect(() => {
    async function loadData() {
      let res = await orbis.isConnected();

      if (!router.isReady) return;

      if (res) {
        setUser(res);
      }

      if (!res) {
        let res = await orbis.connect();
        setUser(res);
      }

      let result = await orbis.getPosts({
        context:
          "kjzl6cwe1jw147hcck185xfdlrxq9zv0y0hoa6shzskqfnio56lhf8190yaei7w",
        tag: router.query.id,
      });

      setMessages(result.data);
    }
    loadData();
  }, [router.isReady]);

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
                px="xs"
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
                    key={i}
                    shadow="xs"
                    mt={4}
                    sx={{ backgroundColor: "#80c7fc1d" }}
                    withBorder
                    px="xl"
                  >
                    <Group spacing="xs">
                      <Avatar size={25} color="blue">
                        <Image
                          src={
                            post.creator_details.profile.pfp ??
                            "https://evm.pinsave.app/PinSaveCard.png"
                          }
                        />
                      </Avatar>
                      <Text mt={3}>
                        <a
                          href={`https://evm.pinsave.app/profile/${post.creator.substring(
                            post.creator.indexOf(":0x") + 1
                          )}`}
                          style={{ color: "#198b6eb9" }}
                        >
                          {post.creator_details.profile.username}
                        </a>
                        : <a>{post.content.body}</a>
                      </Text>
                    </Group>

                    <Button
                      size="xs"
                      component="a"
                      radius="sm"
                      onClick={() => sendReaction(post.stream_id, "like")}
                    >
                      {post.count_likes} ❤️
                    </Button>
                    <Button
                      size="xs"
                      component="a"
                      radius="sm"
                      ml={4}
                      onClick={() => sendReaction(post.stream_id, "ha-ha")}
                    >
                      {post.count_haha} 🤣
                    </Button>
                    <Button
                      size="xs"
                      component="a"
                      radius="sm"
                      ml={4}
                      onClick={() => sendReaction(post.stream_id, "downvote")}
                    >
                      {post.count_downvotes} 👎
                    </Button>
                    <Text sx={{ float: "right" }}>
                      {timeConverter(post.timestamp)}
                    </Text>
                  </Paper>
                ))}

              <TextInput
                my="lg"
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                placeholder="Enter your message"
                sx={{ maxWidth: "240px" }}
              />
              <Button component="a" radius="lg" onClick={() => sendMessage()}>
                Send Message
              </Button>
            </Paper>
          </SimpleGrid>
        </>
      )}
    </div>
  );
};

export default PostPage;
