import { timeConverter } from "@/utils/time";
import { getContractInfo } from "@/utils/contracts";
import { sendMessage, sendReaction } from "@/services/orbis";
import { loadData } from "@/services/orbis";
import type { IndividualPost } from "@/services/upload";

import { useState, useEffect } from "react";
import {
  Paper,
  Image,
  Button,
  TextInput,
  Text,
  Group,
  Avatar,
  Switch,
  Title,
} from "@mantine/core";
import { BiDislike } from "react-icons/bi";
import { FaLaughSquint } from "react-icons/fa";
import { Heart } from "tabler-icons-react";
import { Orbis } from "@orbisclub/orbis-sdk";
import { useRouter } from "next/router";
import { ChainName } from "@/constants/chains";

interface IMyProps {
  post: IndividualPost;
  currentChain: ChainName;
}

const orbis: IOrbis = new Orbis();
const context =
  "kjzl6cwe1jw147hcck185xfdlrxq9zv0y0hoa6shzskqfnio56lhf8190yaei7w";

const MediaDetails: React.FC<IMyProps> = ({ post, currentChain }) => {
  const router = useRouter();
  const queryId = String(router.query.id);
  const [isEncrypted, setIsEncrypted] = useState(false);

  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<any | undefined>();
  const [orbisResponse, setOrbisResponse] = useState<any>();

  const { address } = getContractInfo(250);

  useEffect(() => {
    loadData(orbis, router, context, queryId, setMessages);
  }, [router, router.isReady, queryId, orbisResponse]);

  return (
    <Paper shadow="sm" p="md" withBorder>
      <Title mb="1.4rem">{post.name}</Title>
      <Paper
        shadow="xs"
        withBorder
        px="xs"
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
      {messages?.map((message: any, i: number) => (
        <Paper
          key={i}
          shadow="xs"
          mt={4}
          sx={{ backgroundColor: "#80c7fc1d" }}
          withBorder
          px="xl"
        >
          <Group spacing="xs">
            <Avatar size={40} color="blue">
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
                style={{ color: "#198b6eb9", fontSize: "smaller" }}
              >
                {message.creator_details.profile?.username ??
                  message.creator.substring(
                    message.creator.indexOf(":0x") + 1,
                    message.creator.indexOf(":0x") + 8
                  ) + "..."}
              </a>
              : {message.newData}
            </Text>
          </Group>
          <Group>
            <Button
              color="red"
              size="xs"
              component="a"
              radius="sm"
              rightIcon={<Heart fill="white" />}
              onClick={() =>
                sendReaction(message.stream_id, "like", orbis, setOrbisResponse)
              }
            >
              {message.count_likes}
            </Button>
            <Button
              size="xs"
              component="a"
              radius="sm"
              rightIcon={<FaLaughSquint size={22} />}
              ml={4}
              onClick={() =>
                sendReaction(message.stream_id, "haha", orbis, setOrbisResponse)
              }
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
                sendReaction(
                  message.stream_id,
                  "downvote",
                  orbis,
                  setOrbisResponse
                )
              }
            >
              {message.count_downvotes}
            </Button>
            <Text sx={{ fontSize: "small" }}>
              {timeConverter(message.timestamp)}
            </Text>
          </Group>
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
        <Switch onClick={() => setIsEncrypted((prevCheck) => !prevCheck)} />
      </Group>
      <Button
        component="a"
        radius="lg"
        onClick={async () =>
          (await sendMessage(
            context,
            isEncrypted,
            orbis,
            newMessage,
            queryId,
            address,
            currentChain,
            setOrbisResponse
          )) && setNewMessage("")
        }
      >
        Send Message
      </Button>
    </Paper>
  );
};

export default MediaDetails;
