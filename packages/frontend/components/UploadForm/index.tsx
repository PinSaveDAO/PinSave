import {
  Text,
  Paper,
  Title,
  TextInput,
  Textarea,
  Group,
  Button,
  Image,
  Center,
  MediaQuery,
} from "@mantine/core";
import React, { useState } from "react";
import { Upload, Replace } from "tabler-icons-react";
import { Dropzone, DropzoneStatus, IMAGE_MIME_TYPE } from "@mantine/dropzone";
export const dropzoneChildren = (
  status: DropzoneStatus,
  image: File | undefined
) => {
  if (image)
    return (
      <Group
        position="center"
        spacing="xl"
        style={{ minHeight: 220, pointerEvents: "none" }}
      >
        <Image
          src={URL.createObjectURL(image)}
          alt=""
          my="md"
          radius="lg"
          sx={{ maxWidth: "240px" }}
        />
        <Group sx={{ color: "#3a3a3a79" }}>
          <MediaQuery
            query="(max-width:500px)"
            styles={{
              marginLeft: "auto",
              marginRight: "auto",
              maxHeight: "30px",
            }}
          >
            <Replace size={40} />
          </MediaQuery>
          <Text size="md" inline align="center">
            Click/Drag here to replace image
          </Text>
        </Group>
      </Group>
    );
  return (
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
};
const UploadForm = () => {
  const [image, setImage] = useState<File | undefined>();
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
        onDrop={(files) => setImage(files[0])}
        maxSize={3 * 1024 ** 2}
        multiple={false}
        accept={IMAGE_MIME_TYPE}
      >
        {(status) => dropzoneChildren(status, image)}
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
