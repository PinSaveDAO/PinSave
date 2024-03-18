import { Paper, Text, Title, Button, Group, TextInput } from "@mantine/core";
import { MerkleMap, PublicKey, Signature } from "o1js";
import {
  deserializeJsonToMerkleMap,
  getAppContract,
  createTxOptions,
  deserializeNFT,
  startBerkeleyClient,
  createMintTxFromMap,
  mintVercelNFT,
  getAppString,
  mintVercelMetadata,
  getTotalInitedLive,
} from "pin-mina";
import { useEffect, useState } from "react";

import { getVercelClient } from "@/services/vercelClient";
import type { IndividualPost } from "@/services/upload";
import { setMinaAccount } from "@/hooks/minaWallet";
import { fetcher } from "@/utils/fetcher";
import { useAddressContext } from "context";

interface IMyProps {
  post: IndividualPost;
}

interface CustomWindow extends Window {
  mina?: any;
}

const MediaDetails: React.FC<IMyProps> = ({ post }) => {
  const key = "auroWalletAddress";
  const postNumber = Number(post.id);

  const [newMessage, setNewMessage] = useState<string>();

  let messagesQueried = [
    {
      address: "B62qjV6mDV4dJSp2Gu6QdnqEFv9FmRnMpVraC9qjRbBL5mQBLdowmYv",
      message: "new message",
    },
  ];

  const [map, setMap] = useState<MerkleMap | undefined>(undefined);
  const [hash, setHash] = useState<string | undefined>(undefined);

  const { address, setAddress } = useAddressContext();

  async function mintNFTClient() {
    if (!address) {
      const connectedAddress = await setMinaAccount(key);
      setAddress(connectedAddress);
    }
    if (map && address) {
      const zkApp = getAppContract();
      const appId = getAppString();

      const client = getVercelClient();
      startBerkeleyClient();

      const dataNft = await fetcher(`/api/nft/${postNumber}`);
      const nft = deserializeNFT(dataNft);

      const compile = true;

      const totalInited = await getTotalInitedLive(zkApp);

      const adminSignatureData = await fetch(`/api/mint/`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ postNumber: postNumber }),
      });
      const adminSignatureJSON = await adminSignatureData.json();
      const adminSignatureBase58 = adminSignatureJSON.adminSignatureBase58;
      const adminSignature = Signature.fromBase58(adminSignatureBase58);

      const pub = PublicKey.fromBase58(address);
      const txOptions = createTxOptions(pub);

      const txMint = await createMintTxFromMap(
        pub,
        zkApp,
        nft,
        map,
        adminSignature,
        compile,
        txOptions
      );

      const transactionJSON = txMint.toJSON();

      const sendTransactionResult = await (
        window as CustomWindow
      ).mina?.sendTransaction({
        transaction: transactionJSON,
      });

      setHash(sendTransactionResult.hash);

      await mintVercelNFT(appId, postNumber, client);
      await mintVercelMetadata(appId, postNumber, client);
    }
  }

  useEffect(() => {
    const fetchMediaDetails = async () => {
      try {
        const dataMap = await fetcher("/api/getMap");
        const map = deserializeJsonToMerkleMap(dataMap.map);
        setMap(map);
        const savedAddress = sessionStorage.getItem(key);
        if (savedAddress && savedAddress !== "undefined") {
          setAddress(savedAddress);
        }
      } catch (error) {
        console.error("Error fetching media details: ", error);
      }
    };
    fetchMediaDetails();
  }, [post.id, address]);
  return (
    <Paper shadow="sm" p="md" withBorder>
      <Title mb="1.4rem" my={2}>
        {post.name}
      </Title>
      <Paper
        shadow="xs"
        withBorder
        px="xs"
        sx={{ backgroundColor: "#82c7fc1d" }}
      >
        <Text my={2}>{post.description}</Text>
      </Paper>
      <p style={{ fontSize: "small", color: "#0000008d" }}>
        Owned by:{" "}
        <a
          style={{ color: "#198b6eb9" }}
          href={`https://minascan.io/berkeley/account/${post.owner}`}
        >
          {post.owner.substring(0, 8) + "..." + post.owner.substring(45)}
        </a>
      </p>
      {address === post.owner && post.isMinted === "1" && (
        <p style={{ fontSize: "small", color: "#0000008d" }}>Minted</p>
      )}
      {hash ? (
        <p style={{ fontSize: "small", color: "#0000008d" }}>
          <a
            style={{ color: "#198b6eb9" }}
            href={`https://minascan.io/berkeley/tx/${hash}`}
          >
            hash
          </a>
        </p>
      ) : null}
      {address === post.owner && post.isMinted === "0" && map ? (
        <Button onClick={async () => await mintNFTClient()}>Mint</Button>
      ) : null}
      {messagesQueried?.map((message: any, i: number) => (
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
              {post.owner.substring(0, 8) + "..." + post.owner.substring(45)}
            </a>{" "}
            {message.message}
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
        <Button
          component="a"
          radius="lg"
          //onClick={async () => ()}
        >
          Send Message
        </Button>
      ) : (
        <Text>Connect Wallet to send messages</Text>
      )}
    </Paper>
  );
};

export default MediaDetails;
