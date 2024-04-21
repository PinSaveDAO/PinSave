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
  Center,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useState } from "react";
import ReactPlayer from "react-player";
import { Upload, Replace } from "tabler-icons-react";
import { PublicKey, Field, Signature, MerkleMap } from "o1js";
import {
  startBerkeleyClient,
  NFTMetadata,
  createInitNFTTxFromMap,
  createNFT,
  deserializeJsonToMerkleMap,
  createTxOptions,
  getTotalInitedLive,
  getAppVars,
  NFT,
  TxOptions,
} from "pin-mina";

import { setMinaAccount } from "@/hooks/minaWallet";
import { UploadData } from "@/services/upload";
import { fetcher } from "@/utils/fetcher";
import { useAddressContext } from "context";

export const dropzoneChildren = (image: File | undefined) => {
  if (image) {
    const link: string = URL.createObjectURL(image);
    return (
      <Group
        position="center"
        spacing="xl"
        style={{ minHeight: 220, pointerEvents: "none" }}
      >
        {image.type.startsWith("i") ? (
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
  const { address, setAddress } = useAddressContext();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<File | undefined>();
  const [hash, setHash] = useState<string | undefined>(undefined);

  const isDataCorrect =
    name !== "" && description !== "" && image !== undefined;

  async function savePostBeforeUpload(
    name: string,
    description: string,
    image: File
  ) {
    if (description !== "" && name !== "" && address) {
      startBerkeleyClient();
      const { appContract } = getAppVars();
      const totalInited: number = await getTotalInitedLive(appContract, true);
      const pub: PublicKey = PublicKey.fromBase58(address);
      const cid: string = await UploadData(image);
      const nftMetadata: NFTMetadata = {
        name: name,
        description: description,
        id: Field(totalInited),
        cid: cid,
        owner: pub,
        isMinted: "0",
      };
      const nftHashed: NFT = createNFT(nftMetadata);
      const dataMap: { map: string } = await fetcher("/api/getMap");
      const map: MerkleMap = deserializeJsonToMerkleMap(dataMap.map);
      const adminSignatureData: Response = await fetch(
        `/api/init/adminSignature/`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            name: name,
            description: description,
            id: totalInited,
            cid: cid,
            owner: address,
            isMinted: "0",
          }),
        }
      );
      const adminSignatureJSON: {
        adminSignatureBase58: string;
        attemptId: string | number;
      } = await adminSignatureData.json();
      const adminSignatureBase58: string =
        adminSignatureJSON.adminSignatureBase58;
      const adminSignature: Signature =
        Signature.fromBase58(adminSignatureBase58);
      const attemptId: string | number = adminSignatureJSON.attemptId;
      const compile: boolean = true;
      const txOptions: TxOptions = createTxOptions(pub);
      const transactionJSON: string = await createInitNFTTxFromMap(
        nftHashed,
        appContract,
        map,
        adminSignature,
        compile,
        txOptions
      );
      const sendTransactionResult = await window.mina?.sendTransaction({
        transaction: transactionJSON,
      });
      console.log(sendTransactionResult);
      const hash = sendTransactionResult.hash;
      setHash(hash);

      const uploadDataResponse: Response = await fetch(
        `/api/init/uploadData/`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            nftMetadata: nftMetadata,
            attemptId: attemptId,
            txId: hash,
          }),
        }
      );
      const uploadDataJSON: { response: boolean } =
        await uploadDataResponse.json();
      const uploadedData: boolean = uploadDataJSON.response;
      setImage(undefined);
      setName("");
      setDescription("");
      if (uploadedData === true) {
        console.log("uploaded data");
      }
      return true;
    }
    return false;
  }

  return (
    <Paper
      withBorder
      p="xl"
      shadow="xl"
      radius="lg"
      sx={{ maxWidth: "950px" }}
      mx="auto"
    >
      <Title
        order={1}
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
        placeholder="Provide description to your post here"
      />
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
        ]}
      >
        {() => dropzoneChildren(image)}
      </Dropzone>
      <Group position="center" sx={{ padding: 15 }}>
        {!address && (
          <Button
            component="a"
            radius="lg"
            mt="md"
            onClick={async () => setAddress(await setMinaAccount())}
          >
            Connect Wallet
          </Button>
        )}
        {isDataCorrect && address && (
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
        )}
        {!isDataCorrect && address && (
          <Text component="a" mt="md">
            Upload Data
          </Text>
        )}
      </Group>
      {hash && (
        <Center>
          <a
            style={{ color: "#198b6eb9" }}
            href={`https://minascan.io/berkeley/tx/${hash}`}
          >
            hash
          </a>
        </Center>
      )}
    </Paper>
  );
};

export default UploadForm;
