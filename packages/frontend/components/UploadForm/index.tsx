import {
  Text,
  Paper,
  Title,
  TextInput,
  Textarea,
  MantineTheme,
  Group,
  useMantineTheme,
  Button,
  Center,
} from "@mantine/core";
import React from "react";
import { Upload } from "tabler-icons-react";
import { Dropzone, DropzoneStatus, IMAGE_MIME_TYPE } from "@mantine/dropzone";
export const dropzoneChildren = (
  status: DropzoneStatus,
  theme: MantineTheme
) => (
  <Group
    position="center"
    spacing="xl"
    style={{ minHeight: 220, pointerEvents: "none" }}
  >
    <Upload size={80} />

    <div>
      <Text size="xl" inline>
        Drag image here or click to select a image
      </Text>
      <Text size="sm" color="dimmed" inline mt={7}>
        Image should not exceed 5mb
      </Text>
    </div>
  </Group>
);
const UploadForm = () => {
  const theme = useMantineTheme();
  return (
    <Paper
      withBorder
      shadow="xl"
      p="xl"
      radius="lg"
      sx={{ maxWidth: "900px" }}
      mx="auto"
    >
      <Title my="lg">Upload a new Post</Title>
      <TextInput required label="Title" placeholder="Post Title" />
      <Textarea
        my="lg"
        required
        label="Description"
        placeholder="Describe your post here"
      />
      <Dropzone
        mt="md"
        onDrop={(files) => console.log("accepted files", files)}
        onReject={(files) => console.log("rejected files", files)}
        maxSize={3 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
      >
        {(status) => dropzoneChildren(status, theme)}
      </Dropzone>
      <Center>
        <Button radius="lg" mt="md">
          Upload Post
        </Button>
      </Center>
    </Paper>
  );
};

export default UploadForm;
