import { UploadData } from "@/services/upload";
import { setMinaAccount } from "@/hooks/minaWallet";

import {
  Text,
  Paper,
  Title,
  TextInput,
  Textarea,
  Group,
  Button,
  Image,
  MediaQuery,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { Upload, Replace } from "tabler-icons-react";
import { PublicKey, Field } from "o1js";
import {
  startBerkeleyClient,
  NFTMetadata,
  createInitNFTTxFromMap,
  createNFT,
  deserializeJsonToMerkleMap,
  getAppContract,
  getAppString,
  createTxOptions,
  setVercelNFT,
  setVercelMetadata,
} from "pin-mina";
import { kv, createClient } from "@vercel/kv";

interface CustomWindow extends Window {
  mina?: any;
}

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
          Image should not exceed 1 000 000 bytes
        </Text>
      </div>
    </Group>
  );
};

const UploadForm = () => {
  const key = "auroWalletAddress";
  const [address, setAddress] = useState<string | undefined>();

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<File | undefined>();
  //const [postReceiver, setPostReceiver] = useState<string | undefined>();

  const isDataCorrect =
    name !== "" && description !== "" && image !== undefined;

  async function savePostBeforeUpload(
    name: string,
    description: string,
    image: File
  ) {
    if (description !== "" && name !== "" && address) {
      startBerkeleyClient();
      const pub = PublicKey.fromBase58(address);

      const response = await fetch("/api/totalInited");
      const data = await response.json();
      const totalInited = data.totalInited;

      const isDev = process.env.NEXT_PUBLIC_ISDEV ?? "false";
      let client = kv;
      if (isDev === "true") {
        const url = process.env.NEXT_PUBLIC_REDIS_URL;
        const token = process.env.NEXT_PUBLIC_REDIS_TOKEN;
        client = createClient({
          url: url,
          token: token,
        });
      }

      const cid = await UploadData(image);
      const nftMetadata: NFTMetadata = {
        name: name,
        description: description,
        id: Field(totalInited),
        cid: cid,
        owner: pub,
      };
      const nftHashed = createNFT(nftMetadata);

      const responseMap = await fetch("/api/getMap");
      const dataMap = await responseMap.json();

      const map = deserializeJsonToMerkleMap(dataMap.map);
      const zkApp = getAppContract();
      const appId = getAppString();

      const compile = true;
      const txOptions = createTxOptions(pub);
      const tx = await createInitNFTTxFromMap(
        nftHashed,
        zkApp,
        map,
        compile,
        txOptions
      );

      const transactionJSON = tx.toJSON();

      await (window as CustomWindow).mina?.sendTransaction({
        transaction: transactionJSON,
      });

      await setVercelNFT(appId, nftHashed, client);
      await setVercelMetadata(appId, nftMetadata, client);

      setImage(undefined);
      setName("");
      setDescription("");

      return true;
    }
    return false;
  }

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const savedAddress = sessionStorage.getItem(key);
        if (savedAddress && savedAddress !== "undefined") {
          setAddress(savedAddress);
        }
      } catch (error) {
        console.error("Error fetching media details: ", error);
      }
    };
    fetchAddress();
  }, []);

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
      {/* <Textarea
        my="lg"
        onChange={(e) => setPostReceiver(e.target.value)}
        value={postReceiver}
        label="Post Receiver"
        placeholder="Enter Address You Want To Receive The NFT"
      /> */}
      <Dropzone
        mt="md"
        onReject={(files) => console.log("rejected files", files)}
        onDrop={(files) => setImage(files[0])}
        maxSize={1000000}
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
        {!address ? (
          <Button
            component="a"
            radius="lg"
            mt="md"
            onClick={async () => setAddress(await setMinaAccount(key))}
          >
            Connect Wallet
          </Button>
        ) : null}
        {isDataCorrect && address ? (
          <Button
            component="a"
            radius="lg"
            mt="md"
            onClick={async () =>
              await savePostBeforeUpload(name, description, image)
            }
          >
            Mint Post
          </Button>
        ) : null}
        {!isDataCorrect ? (
          <Text component="a" mt="md">
            Upload Data
          </Text>
        ) : null}
      </Group>
    </Paper>
  );
};

export default UploadForm;
