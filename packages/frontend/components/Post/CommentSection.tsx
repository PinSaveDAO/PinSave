import { Text, Button, TextInput, Group, Paper } from "@mantine/core";
import { useState } from "react";

import { setMinaAccount } from "@/hooks/minaWallet";
import { useAddressContext } from "context";

type message = {
  content: string;
  address: string;
};

interface IMyProps {
  messagesQueried: message[];
  address: string;
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

const CommentSection: React.FC<IMyProps> = ({ messagesQueried }) => {
  const { address, setAddress } = useAddressContext();
  const [newMessage, setNewMessage] = useState<string>("");
  async function signMessage() {
    const signContent: SignMessageArgs = {
      message: newMessage,
    };
    const signResult: SignedData = await window.mina?.signMessage(signContent);
    if (signResult.publicKey === address) {
    }
  }
  return (
    <>
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
              href={`https://minascan.io/berkeley/account/${message.address}`}
              style={{ color: "#198b6eb9", fontSize: "smaller" }}
            >
              {message.address.substring(0, 8) +
                "..." +
                message.address.substring(45)}
            </a>{" "}
            {message.content}
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
    </>
  );
};

export default CommentSection;
