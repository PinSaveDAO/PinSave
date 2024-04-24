import { useState } from "react";
import {
  Text,
  Button,
  TextInput,
  Group,
  Paper,
  Center,
  Stack,
} from "@mantine/core";

import { setMinaAccount } from "@/hooks/minaWallet";
import { useComments } from "@/hooks/api";
import { useAddressContext } from "context";

type message = {
  data: string;
  publicKey: string;
};

interface IMyProps {
  postId: string | number;
}

interface SignedData {
  publicKey: string;
  data: string;
  signature: {
    field: string;
    scalar: string;
  };
}

type SignMessageArgs = {
  message: string;
};

const CommentSection: React.FC<IMyProps> = ({ postId }) => {
  const { address, setAddress } = useAddressContext();
  const { data: messagesQueried, isLoading, isFetched } = useComments(postId);
  const [newMessage, setNewMessage] = useState<string>("");

  async function signMessage() {
    const signContent: SignMessageArgs = {
      message: newMessage,
    };
    const signResult: SignedData = await window.mina?.signMessage(signContent);
    if (signResult.publicKey === address) {
      await fetch(`/api/comments/post/`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ signResult: signResult, postId: postId }),
      });
      setNewMessage("");
    }
  }
  return (
    <div>
      {!messagesQueried?.comments && isLoading && (
        <Center mt="md">
          <Stack
            sx={{
              maxWidth: 700,
            }}
          >
            <Text>Loading...</Text>
          </Stack>
        </Center>
      )}

      {isFetched && (
        <Text mt="sm">
          {messagesQueried?.comments?.map((message: message) => (
            <Paper
              key={`${message.data.substring(10)}`}
              shadow="xs"
              mt={3}
              sx={{ backgroundColor: "#82c7fc1d" }}
              withBorder
              px="xs"
            >
              <Text mt={2} mb={2}>
                <a
                  href={`https://minascan.io/berkeley/account/${message.publicKey}`}
                  style={{ color: "#198b6eb9", fontSize: "smaller" }}
                >
                  {message.publicKey.substring(0, 8) +
                    "..." +
                    message.publicKey.substring(45)}
                </a>
                {": "}
                {message.data}
              </Text>
            </Paper>
          ))}
        </Text>
      )}
      <Center>
        <Group>
          <TextInput
            mt="md"
            onChange={(e) => setNewMessage(e.target.value)}
            value={newMessage}
            placeholder="Enter your message"
            sx={{ maxWidth: "240px" }}
          />

          {address ? (
            <Button component="a" radius="lg" mt="md" onClick={signMessage}>
              Send Message
            </Button>
          ) : (
            <Button
              component="a"
              radius="lg"
              mt="md"
              onClick={async () => setAddress(await setMinaAccount())}
            >
              Connect Wallet
            </Button>
          )}
        </Group>
      </Center>
    </div>
  );
};

export default CommentSection;
