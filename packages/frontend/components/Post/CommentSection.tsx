import { useState } from "react";
import { Text, Button, TextInput, Group, Paper } from "@mantine/core";

import { setMinaAccount } from "@/hooks/minaWallet";
import { useAddressContext } from "context";

type message = {
  data: string;
  publicKey: string;
};

interface IMyProps {
  messagesQueried: message[];
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

const CommentSection: React.FC<IMyProps> = ({ postId, messagesQueried }) => {
  const { address, setAddress } = useAddressContext();
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
      {messagesQueried?.map((message: message, i: number) => (
        <Paper
          key={i}
          shadow="xs"
          mt={4}
          sx={{ backgroundColor: "#20c7fc1d" }}
          withBorder
          px="sm"
        >
          <Text mt={3}>
            <a
              href={`https://minascan.io/berkeley/account/${message.publicKey}`}
              style={{ color: "#198b6eb9", fontSize: "smaller" }}
            >
              {message.publicKey.substring(0, 8) +
                "..." +
                message.publicKey.substring(45)}
            </a>{" "}
            {message.data}
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
      </Group>
      {address ? (
        <Button component="a" radius="lg" onClick={signMessage}>
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
    </div>
  );
};

export default CommentSection;
