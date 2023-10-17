import {
  ActionIcon,
  Button,
  Collapse,
  Divider,
  Group,
  Text,
  TextInput,
  Title,
  Box,
  Card,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "tabler-icons-react";
interface Dispute {
  label?: string;
  replies?: string[];
}

const DisputeInfo = ({
  dispute,
  onReplySubmit,
}: {
  dispute?: Dispute;
  onReplySubmit?: (t: string) => any;
}) => {
  const [opened, { toggle }] = useDisclosure(false);
  const [reply, setReply] = useState<string>();
  const CorrectReply = ({ t }: { t: string }) => (
    <Group px={4} sx={{ backgroundColor: "#A3EBB1", borderRadius: "4px" }}>
      <Text>{t}</Text>
      <Text ml="auto">✅</Text>
    </Group>
  );
  return (
    <>
      <Group onClick={toggle}>
        <Text>{dispute?.label ?? "Lorem ipsum dolor sit amet?"}</Text>
        <ActionIcon onClick={toggle} ml="auto">
          {opened ? <ChevronUp /> : <ChevronDown />}
        </ActionIcon>
      </Group>
      <Divider />
      <Collapse in={opened} my="md">
        <Title order={5}>Replies</Title>
        {!dispute?.label && (
          <>
            <CorrectReply t={"LOREM!"} />
            <Text px={4}>Dolor sit amet!</Text>
          </>
        )}
        {dispute?.replies?.map((r, i) => (
          <Text px={4} key={i}>
            {r}
          </Text>
        ))}
        <Card shadow="md" mb={2} withBorder radius="md">
          <Title order={5}>Reply to dispute</Title>
          <TextInput
            mt="sm"
            onChange={(e) => setReply(e.target.value)}
            value={reply}
            placeholder="Enter your reply"
          />
          <Text size="xs" mb="md">
            In order to reply to dispute you&apos;ll need to stake 0.XX ETH
          </Text>
          <Box sx={{ textAlign: "right" }}>
            <Button
              onClick={
                onReplySubmit ? () => onReplySubmit(reply ?? "") : () => {}
              }
            >
              Stake & Submit Reply
            </Button>
          </Box>
        </Card>

        <Divider mt={4} />
      </Collapse>
    </>
  );
};

export default DisputeInfo;
