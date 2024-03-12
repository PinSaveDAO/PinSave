import { Paper, Text, Title, Button } from "@mantine/core";
import { MerkleMap, PublicKey } from "o1js";
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
} from "pin-mina";
import { useEffect, useState } from "react";

import { getVercelClient } from "@/services/vercelClient";
import type { IndividualPost } from "@/services/upload";
import { setMinaAccount } from "@/hooks/minaWallet";
import { fetcher } from "@/utils/fetcher";

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
  const [hash, setHash] = useState<string | undefined>(undefined);

  async function mintNFT() {
    if (!address) {
      const connectedAddress = await setMinaAccount(key);
      const pub = PublicKey.fromBase58(connectedAddress);
      setAddress(pub);
    }
    if (map && address) {
      const zkApp = getAppContract();
      const appId = getAppString();

      startBerkeleyClient();
      const dataNft = await fetcher(`/api/nft/${postNumber}`);

      const nft = deserializeNFT(dataNft);

      const compile = true;
      const txOptions = createTxOptions(address);

      const txMint = await createMintTxFromMap(
        address,
        zkApp,
        nft,
        map,
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

      const client = await getVercelClient();
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
          setAddress(PublicKey.fromBase58(savedAddress));
        }
      } catch (error) {
        console.error("Error fetching media details: ", error);
      }
    };
    fetchMediaDetails();
  }, [post.id]);
  return (
    <Paper
      shadow="sm"
      p="md"
      withBorder
      style={{
        width: "99%",
        borderRadius: "10px",
      }}
    >
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
      {address?.toBase58() === post.owner && post.isMinted === "1" ? (
        <p style={{ fontSize: "small", color: "#0000008d" }}>Minted</p>
      ) : null}
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
      {address?.toBase58() === post.owner && post.isMinted === "0" ? (
        <Button onClick={async () => await mintNFT()}>Mint</Button>
      ) : null}
    </Paper>
  );
};

export default MediaDetails;
