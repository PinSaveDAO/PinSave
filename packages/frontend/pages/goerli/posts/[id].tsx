import DisputeInfo from "@/components/Posts/DisputeInfo";
import { usePost } from "@/hooks/api";
import { parseArweaveTxId, parseCid } from "@/services/parseCid";
import { getCurrentChain } from "@/utils/chains";
import { checkType } from "@/utils/media";

import { Player } from "@livepeer/react";
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
  Title,
  Box,
  NumberInput,
} from "@mantine/core";
import { Orbis } from "@orbisclub/orbis-sdk";
import { useRouter } from "next/router";
import React, { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Heart } from "tabler-icons-react";

let orbis = new Orbis();

const PostPage = () => {
  const [reaction, setReaction] = useState<string>();
  const [isEncrypted, setIsEncrypted] = useState(false);

  const [newMessage, setNewMessage] = useState<string>();
  const [disputeAmount, setDisputeAmount] = useState<number>();
  const [messages, setMessages] = useState<any | undefined>();

  const router = useRouter();
  const currentChain = getCurrentChain(5);
  const { data: post, isLoading } = usePost(
    currentChain,
    router.query.id as string,
  );
  const idParsed = useMemo(
    () =>
      parseCid(post?.image as string) ??
      parseArweaveTxId(post?.image as string),
    [post?.image],
  );

  const sendMessage = async function (context: string) {
    if (isEncrypted)
      await orbis.createPost(
        {
          body: newMessage,
          context: context,
          tags: [
            {
              slug: "goerli" + router.query.id,
              title: "goerli" + router.query.id,
            },
          ],
        },
        {
          type: "custom",
          accessControlConditions: [
            {
              contractAddress: "0x042E56d9729dD6215ad58EB726c6347948BB9518",
              standardContractType: "ERC721",
              chain: "goerli",
              method: "balanceOf",
              parameters: [":userAddress"],
              returnValueTest: { comparator: ">=", value: "1" },
            },
          ],
        },
      );
    if (!isEncrypted)
      await orbis.createPost({
        body: newMessage,
        context: context,
        tags: [
          {
            slug: "goerli" + router.query.id,
            title: "goerli" + router.query.id,
          },
        ],
      });
  };

  const sendReaction = async function (id: string, reaction: string) {
    await orbis.react(id, reaction);
    setReaction(id + reaction);
  };

  const getMessage = async function (content: any) {
    if (content?.content?.body === "") {
      let res = await orbis.decryptPost(content.content);
      return res.result;
    }
    return content?.content?.body;
  };

  useEffect(() => {
    async function loadData() {
      let res = await orbis.isConnected();

      if (!router.isReady) return;

      if (!res) {
        res = await orbis.connect();
      }

      let result = await orbis.getPosts({
        context:
          "kjzl6cwe1jw147hcck185xfdlrxq9zv0y0hoa6shzskqfnio56lhf8190yaei7w",
        tag: "goerli" + router.query.id,
      });

      const messagesData = await Promise.all(
        result.data.map(async (obj: object) => {
          return {
            ...obj,
            newData: await getMessage(obj),
          };
        }),
      );

      setMessages(messagesData);
    }
    loadData();
  }, [router.isReady, router.query.id, newMessage, reaction]);

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
            {checkType(post.image) === false ? (
              <Image
                height={550}
                fit="contain"
                src={post.image ?? "https://evm.pinsave.app/PinSaveCard.png"}
                alt={post.name}
              />
            ) : (
              <Player
                title={idParsed}
                src={post.image}
                autoPlay
                muted
                autoUrlUpload={{
                  fallback: true,
                  ipfsGateway: "https://w3s.link",
                }}
              />
            )}
            <Paper shadow="sm" p="md" withBorder>
              <Title mb="1.4rem">{post.name}</Title>
              <Paper
                shadow="xs"
                withBorder
                px="sm"
                sx={{ backgroundColor: "#82c7fc1d" }}
              >
                <Text my={2}>{post.description}</Text>
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
              {/* {messages &&
								messages.map((message: any, i: number) => (
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
														message.creator_details.profile?.pfp ??
														"https://evm.pinsave.app/PinSaveCard.png"
													}
													alt="profile"
												/>
											</Avatar>
											<Text mt={3}>
												<a
													href={`https://evm.pinsave.app/profile/${message.creator.substring(
														message.creator.indexOf(":0x") + 1
													)}`}
													style={{ color: "#198b6eb9" }}
												>
													{message.creator_details.profile?.username ??
														message.creator.substring(
															message.creator.indexOf(":0x") + 1
														)}
												</a>
												: {message.newData}
											</Text>
										</Group>
										<Button
											color="red"
											size="xs"
											component="a"
											radius="sm"
											rightIcon={<Heart fill="white" />}
											onClick={() => sendReaction(message.stream_id, "like")}
										>
											{message.count_likes}
										</Button>
										<Button
											size="xs"
											component="a"
											radius="sm"
											rightIcon={<FaLaughSquint size={22} />}
											ml={4}
											onClick={() => sendReaction(message.stream_id, "haha")}
										>
											{message.count_haha}
										</Button>
										<Button
											color="blue"
											size="xs"
											component="a"
											radius="sm"
											ml={4}
											rightIcon={<BiDislike size={22} />}
											onClick={() =>
												sendReaction(message.stream_id, "downvote")
											}
										>
											{message.count_downvotes}
										</Button>
										<Text sx={{ float: "right" }}>
											{timeConverter(message.timestamp)}
										</Text>
									</Paper>
								))}
							<Group>
								<TextInput
									my="lg"
									onChange={(e) => setNewMessage(e.target.value)}
									value={newMessage}
									placeholder="Enter your message"
									sx={{ maxWidth: "240px" }}
								/>
								<Text>Only for PinSave holders:</Text>
								<Switch
									onClick={() => setIsEncrypted((prevCheck) => !prevCheck)}
								/>
							</Group>
							<Button
								component="a"
								radius="lg"
								onClick={() =>
									sendMessage(
										"kjzl6cwe1jw147hcck185xfdlrxq9zv0y0hoa6shzskqfnio56lhf8190yaei7w"
									)
								}
							>
								Send Message
							</Button> */}
              {
                ///TODO impl disputes logic
              }
              <Box my="lg">
                <Title order={4}>Create new dispute</Title>
                <TextInput
                  my="sm"
                  label="Dispute message"
                  onChange={(e) => setNewMessage(e.target.value)}
                  value={newMessage}
                  placeholder="Enter your message"
                />
                <Text size="sm" mb="2px">
                  Dispute amount
                </Text>
                <Group>
                  <NumberInput
                    icon={"Ξ"}
                    placeholder="0.01"
                    onChange={(x) => setDisputeAmount(x)}
                    value={disputeAmount}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button my="auto">Submit dispute</Button>
                </Group>
              </Box>
              <Box my="lg">
                <Title order={4}>Open disputes</Title>
                <DisputeInfo />
                <DisputeInfo />
                <DisputeInfo />
              </Box>
            </Paper>
          </SimpleGrid>
        </>
      )}
    </div>
  );
};

export default PostPage;
