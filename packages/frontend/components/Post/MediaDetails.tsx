import type { IndividualPost } from "@/services/upload";
import { setMinaAccount } from "@/hooks/minaWallet";

import { Paper, Text, Title, Button } from "@mantine/core";
import { MerkleMap, MerkleMapWitness, Field, PublicKey } from "o1js";
import {
  createMintTx,
  deserializeJsonToMerkleMap,
  getAppContract,
  createTxOptions,
  deserializeNft,
  startBerkeleyClient,
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
  const [totalSupply, setTotalSupply] = useState<undefined | number>(undefined);
  const [treeRoot, setTreeRoot] = useState<undefined | string>(undefined);
  const [map, setMap] = useState<MerkleMap | undefined>(undefined);
  const [address, setAddress] = useState<PublicKey | undefined>(undefined);

  async function mintNFT() {
    if (map && address) {
      // https://docs.aurowallet.com/general/reference/api-reference/methods/mina_sendtransaction
      const zkApp = getAppContract();

      startBerkeleyClient();
      const response = await fetch(`/api/nft/${postNumber}`);
      const dataNft = await response.json();

      const nft = deserializeNft(dataNft);
      // create function to serialize nft

      const witnessNFT: MerkleMapWitness = map.getWitness(Field(postNumber));

      const txOptions = createTxOptions(address);

      let transactionJSON = await createMintTx(
        address,
        zkApp,
        nft,
        witnessNFT,
        txOptions
      );
      await (window as CustomWindow).mina?.sendTransaction({
        transaction: transactionJSON,
      });
    }
  }

  useEffect(() => {
    const fetchMediaDetails = async () => {
      try {
        const response = await fetch("/api/totalSupply");
        const data = await response.json();
        setTotalSupply(data.totalSupply);
        const responseMap = await fetch("/api/getMap");
        const dataMap = await responseMap.json();

        const map = deserializeJsonToMerkleMap(dataMap.dataOut);
        setTreeRoot(map.getRoot().toString());
        setMap(map);
 
        const savedAddress = sessionStorage.getItem(key);
        if (savedAddress && savedAddress !== "undefined") {
          setAddress(PublicKey.fromBase58(savedAddress));
        } else {
          // connect to wallet
          await setMinaAccount(key)
        }
      } catch (error) {
        console.error("Error fetching media details: ", error);
      }
    };
    fetchMediaDetails();

    // connect address
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
