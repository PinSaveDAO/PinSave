import type { IndividualPost } from "@/services/upload";
import { setMinaAccount } from "@/hooks/minaWallet";

import { Paper, Text, Title, Button } from "@mantine/core";
import { MerkleMap, PublicKey } from "o1js";
import {
  deserializeJsonToMerkleMap,
  getAppContract,
  createTxOptions,
  deserializeNFT,
  startBerkeleyClient,
  createMintTxFromMap,
} from "pin-mina";
import React, { useEffect, useState } from "react";

interface IMyProps {
  post: IndividualPost;
}

interface CustomWindow extends Window {
  mina?: any;
}

const MediaDetails: React.FC<IMyProps> = ({ post }) => {
  const key = "auroWalletAddress";
  const postNumber = Number(post.id);
  const [map, setMap] = useState<MerkleMap | undefined>(undefined);
  const [address, setAddress] = useState<PublicKey | undefined>(undefined);

  async function mintNFT() {
    if (!address) {
      const connectedAddress = await setMinaAccount(key);
      const pub = PublicKey.fromBase58(connectedAddress);
      setAddress(pub);
    }
    if (map && address) {
      const zkApp = getAppContract();

      startBerkeleyClient();
      const response = await fetch(`/api/nft/${postNumber}`);
      const dataNft = await response.json();

      const nft = deserializeNFT(dataNft);

      const txOptions = createTxOptions(address);

      const txMint = await createMintTxFromMap(
        address,
        zkApp,
        nft,
        map,
        true,
        txOptions
      );

      const transactionJSON = txMint.toJSON();

      await (window as CustomWindow).mina?.sendTransaction({
        transaction: transactionJSON,
      });
    }
  }

  useEffect(() => {
    const fetchMediaDetails = async () => {
      try {
        const responseMap = await fetch("/api/getMap");
        const dataMap = await responseMap.json();

        const map = deserializeJsonToMerkleMap(dataMap.map);
        setMap(map);

        const savedAddress = sessionStorage.getItem(key);
        if (savedAddress && savedAddress !== "undefined") {
          setAddress(PublicKey.fromBase58(savedAddress));
        }
      } catch (error) {
        console.error("Error fetching media details: ", error);
      }
    };
    fetchMediaDetails();
  }, [post.id]);
  return (
    <Paper shadow="sm" p="md" withBorder>
      <Title mb="1.4rem">{post.name}</Title>
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
          {post.owner.substring(
            post.owner.indexOf(":0x") + 1,
            post.owner.indexOf(":0x") + 8
          ) +
            "..." +
            post.owner.substring(45)}
        </a>
      </p>
      {address?.toBase58() === post.owner ? (
        <Button onClick={async () => await mintNFT()}>Mint</Button>
      ) : null}
    </Paper>
  );
};

export default MediaDetails;
