import { Paper, Text, Title, Button } from "@mantine/core";
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
  getTokenAddressBalance,
} from "pin-mina";
import { useEffect, useState } from "react";

import { getVercelClient } from "@/services/vercelClient";
import type { IndividualPost } from "@/services/upload";
import { setMinaAccount } from "@/hooks/minaWallet";
import { fetcher } from "@/utils/fetcher";
import { useAddressContext } from "context";
import { host } from "@/utils/host";

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
  const [hash, setHash] = useState<string | undefined>(undefined);

  const { address, setAddress } = useAddressContext();

  async function mintNFT() {
    if (!address) {
      const connectedAddress = await setMinaAccount(key);
      setAddress(connectedAddress);
    }
    if (map && address) {
      const zkApp = getAppContract();
      const appId = getAppString();

      startBerkeleyClient();
      const dataNft = await fetcher(`${host}/api/nft/${postNumber}`);
      const nft = deserializeNFT(dataNft);
      const compile = true;
      const pub = PublicKey.fromBase58(address);

      const txOptions = createTxOptions(pub);

      const adminSignatureData = await fetch(`${host}/api/mint/`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ postNumber: postNumber }),
      });
      console.log(postNumber);
      const adminSignatureJSON = await adminSignatureData.json();
      const adminSignatureBase58 = adminSignatureJSON.adminSignatureBase58;
      const adminSignature = Signature.fromBase58(adminSignatureBase58);

      console.log(appId);
      console.log(nft.hash().toString());
      console.log(adminSignatureBase58);

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
      /* 


      const sendTransactionResult = await (
        window as CustomWindow
      ).mina?.sendTransaction({
        transaction: transactionJSON,
      });

      setHash(sendTransactionResult.hash);

      const client = await getVercelClient();
      await mintVercelNFT(appId, postNumber, client);
      await mintVercelMetadata(appId, postNumber, client); */
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
      {address === post.owner && post.isMinted === "1" ? (
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
      {address === post.owner && post.isMinted === "0" && map ? (
        <Button onClick={async () => await mintNFT()}>Mint</Button>
      ) : null}
    </Paper>
  );
};

export default MediaDetails;
