import { UploadData } from "@/services/upload";
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
  NativeSelect,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";

import { useState } from "react";
import ReactPlayer from "react-player";
import { Upload, Replace } from "tabler-icons-react";
import { useAccount, useNetwork } from "wagmi";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { getContractInfo } from "@/utils/contracts";

export const dropzoneChildren = (image: File | undefined) => {
  if (image) {
    let link = URL.createObjectURL(image);
    return (
      <Group
        position="center"
        spacing="xl"
        style={{ minHeight: 220, pointerEvents: "none" }}
      >
        {image.type[0] === "i" ? (
          <Image
            src={link}
            alt="uploaded image"
            my="md"
            radius="lg"
            sx={{ maxWidth: "240px" }}
          />
        ) : (
          <ReactPlayer url={link} />
        )}
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
  }
  return (
    <Group
      position="center"
      spacing="xl"
      style={{ minHeight: 220, pointerEvents: "none" }}
    >
      <Upload size={80} />
      <div>
        <Text size="xl" inline>
          Drag image here or click to select an image
        </Text>
        <Text size="sm" color="dimmed" inline mt={7}>
          Image should not exceed 5mb
        </Text>
      </div>
    </Group>
  );
};

const UploadForm = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const { address: contractAddress, abi } = getContractInfo(chain?.id);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<File | undefined>();
  const [postReceiver, setPostReceiver] = useState<string>("");

  // const [metadata, setMetadata] = useState<PostDataUpload[]>([]);

  const [response, setResponse] = useState<string>("");

  const [provider, setProvider] = useState<string>("NFT.Storage");

  const { config } = usePrepareContractWrite({
    address: contractAddress,
    abi: abi,
    functionName: "mintPost",
    args: [address, response],
  });

  const { write: writeMintPost } = useContractWrite(config);

  async function savePostBeforeUpload(
    name: string,
    description: string,
    image?: File
  ) {
    if (description !== "" && name !== "" && image && address) {
      const cid = await UploadData({
        receiverAddress: address,
        data: { name: name, description: description, image: image },
        provider: provider,
      });

      setResponse(cid);
      console.log(cid);
      console.log(response);
      setImage(undefined);
      setName("");
      setDescription("");
      return true;
    }
    return false;
  }

  return (
    <Paper
      withBorder
      shadow="xl"
      p="xl"
      radius="lg"
      sx={{ maxWidth: "900px" }}
      mx="auto"
    >
      <Title
        order={1}
        my="lg"
        align="center"
        style={{
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
        sx={(theme) => ({
          background: theme.fn.radialGradient("green", "lime"),
        })}
      >
        Upload a new Post
      </Title>
      <TextInput
        required
        label="Title"
        placeholder="Post Title"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Textarea
        my="lg"
        required
        onChange={(e) => setDescription(e.target.value)}
        value={description}
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
        onReject={(files) => console.log("rejected files", files)}
        onDrop={(files) => setImage(files[0])}
        maxSize={25000000}
        multiple={false}
        accept={[
          MIME_TYPES.png,
          MIME_TYPES.jpeg,
          MIME_TYPES.webp,
          MIME_TYPES.svg,
          MIME_TYPES.gif,
          MIME_TYPES.mp4,
        ]}
      >
        {() => dropzoneChildren(image)}
      </Dropzone>
      <Group position="center" sx={{ padding: 15 }}>
        <Button
          component="a"
          radius="lg"
          mt="md"
          onClick={async () =>
            (await savePostBeforeUpload(name, description, image)) &&
            writeMintPost?.()
          }
        >
          Upload Post
        </Button>
      </Group>
      <Center>
        <NativeSelect
          placeholder="Pick IPFS Provider"
          value={provider}
          onChange={(event) => setProvider(event.currentTarget.value)}
          size="sm"
          data={["NFT.Storage", "NFTPort", "Estuary"]}
        />
      </Center>
    </Paper>
  );
};

export default UploadForm;
