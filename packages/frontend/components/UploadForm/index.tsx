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
import { showNotification, updateNotification } from "@mantine/notifications";
import { useAccount, useSigner, useNetwork } from "wagmi";

import { uploadPost, uploadPostSkynet } from "@/services/upload";

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
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [postReceiver, setPostReceiver] = useState("");

  function filledPost() {
    return desc !== "" && title !== "";
  }

  function isValidUpload() {
    return (
      filledPost() &&
      address !== undefined &&
      image !== undefined &&
      signer !== undefined
    );
  }

  const startUpload = async (storageProvider: string) => {
    showNotification({
      id: "upload-post",
      loading: true,
      title: "Uploading post",
      message: "Data will be loaded in a couple of seconds",
      autoClose: false,
      disallowClose: true,
    });

    const check = isValidUpload();
    if (check && storageProvider == "ipfs") {
      if (postReceiver !== "") {
        uploadPost(
          signer!,
          postReceiver,
          {
            name: title,
            description: desc,
            image: image!,
          },
          chain?.id
        );
      }

      if (postReceiver === "") {
        uploadPost(
          signer!,
          address!,
          {
            name: title,
            description: desc,
            image: image!,
          },
          chain?.id
        );
      }
    }

    if (check && storageProvider == "skynet") {
      if (postReceiver !== "") {
        uploadPostSkynet(
          signer!,
          postReceiver,
          {
            name: title,
            description: desc,
            image: image!,
          },
          chain?.id
        );
      }

      if (postReceiver === "") {
        uploadPostSkynet(
          signer!,
          address!,
          {
            name: title,
            description: desc,
            image: image!,
          },
          chain?.id
        );
      }
    }

    if (!isValidUpload()) {
      updateNotification({
        id: "upload-post",
        color: "red",
        title: "Failed to upload post",
        message:
          "Check if you've connected the wallet and you've filled the fields in properly",
      });
    }
  };
  return (
    <Paper
      withBorder
      shadow="xl"
      p="xl"
      radius="lg"
      sx={{ maxWidth: "900px" }}
      mx="auto"
    >
      <Title my="lg" align="center">
        Upload a new Post
      </Title>
      <TextInput
        required
        label="Title"
        placeholder="Post Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        my="lg"
        required
        onChange={(e) => setDesc(e.target.value)}
        value={desc}
        label="Description"
        placeholder="Describe your post here"
      />
      <Textarea
        my="lg"
        onChange={(e) => setPostReceiver(e.target.value)}
        value={postReceiver}
        label="Post Receiver"
        placeholder="Enter Address You Want To Receive The NFT"
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
        <Group position="center" sx={{ padding: 15 }}>
          <Button
            component="a"
            radius="lg"
            mt="md"
            onClick={() => startUpload("ipfs")}
          >
            Upload Post
          </Button>
          <Button
            component="a"
            radius="lg"
            mt="md"
            onClick={() => startUpload("skynet")}
          >
            Upload to Skynet
          </Button>
        </Group>
      </Center>
    </Paper>
  );
};

export default UploadForm;
