import type { IndividualPost } from "@/services/upload";
import { Paper, Text, Title, Button } from "@mantine/core";
import {
  createMintTx,
  getAppContract,
  getAppPublic,
  getAppString,
} from "pin-mina";
import { getVercelNft } from "pin-mina/build/src/components/Nft";
import React, { useEffect, useState } from "react";

interface IMyProps {
  post: IndividualPost;
}

interface CustomWindow extends Window {
  mina?: any;
}

const MediaDetails: React.FC<IMyProps> = ({ post }) => {
  const postNumber = Number(post.id);
  const [totalSupply, setTotalSupply] = useState(null);

  async function mintNFT() {
    const pub = getAppPublic();
    const zkApp = getAppContract();
    const appId = getAppString();
    // const nft = await getVercelNft(appId, 11, client);
    //let transactionJSON = await createMintTx(pub, zkApp, nft);
    /*     const fee = "";
    const memo = ""; */
    /* await (window as CustomWindow).mina?.sendTransaction({
      transaction: transactionJSON,
    }); */
  }

  useEffect(() => {
    const fetchMediaDetails = async () => {
      try {
        const response = await fetch("/api/totalSupply");
        const data = await response.json();
        setTotalSupply(data.totalSupply);
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
            post.owner.substring(35)}
        </a>
      </p>
      {totalSupply && postNumber >= totalSupply ? (
        <Text>Minted</Text>
      ) : (
        <Button onClick={async () => await mintNFT()}>Mint</Button>
      )}
    </Paper>
  );
};

export default MediaDetails;
