import { Paper, Text, Title, Button } from "@mantine/core";
import { MerkleMap, PublicKey, Signature, fetchAccount } from "o1js";
import { useEffect, useState } from "react";
import {
  deserializeJsonToMerkleMap,
  getAppVars,
  createTxOptions,
  deserializeNFT,
  startBerkeleyClient,
  createMintTxFromMap,
  mintVercelNFT,
  mintVercelMetadata,
} from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";
import type { IndividualPost } from "@/services/upload";
import { setMinaAccount } from "@/hooks/minaWallet";
import { fetcher } from "@/utils/fetcher";
import { useAddressContext } from "context";
import CommentSection from "./CommentSection";
import { useComments } from "@/hooks/api";

interface IMyProps {
  post: IndividualPost;
}

const MediaDetails: React.FC<IMyProps> = ({ post }) => {
  const postNumber = Number(post.id);
  const { data } = useComments(postNumber);
  const [map, setMap] = useState<MerkleMap | undefined>(undefined);
  const [hash, setHash] = useState<string | undefined>(undefined);

  const { address, setAddress } = useAddressContext();

  async function mintNFTClient() {
    if (!address) {
      setAddress(await setMinaAccount());
    }
    if (map && address) {
      const { appPubString: appId, appContract: appContract } = getAppVars();

      const client = getVercelClient();
      startBerkeleyClient();

      const dataNft = await fetcher(`/api/nft/${postNumber}`);
      const nft = deserializeNFT(dataNft);

      const compile = true;
      await fetchAccount({ publicKey: appId });

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

      const transactionJSON = await createMintTxFromMap(
        pub,
        appContract,
        nft,
        map,
        adminSignature,
        compile,
        txOptions
      );

      const sendTransactionResult = await window.mina?.sendTransaction({
        transaction: transactionJSON,
      });

      setHash(sendTransactionResult.hash);

      console.log(await mintVercelNFT(appId, postNumber, client));
      console.log(await mintVercelMetadata(appId, postNumber, client));
    }
  }

  useEffect(() => {
    const fetchMediaDetails = async () => {
      const dataMap = await fetcher("/api/getMap");
      const map = deserializeJsonToMerkleMap(dataMap.map);
      setMap(map);
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
      {hash && (
        <p style={{ fontSize: "small", color: "#0000008d" }}>
          <a
            style={{ color: "#198b6eb9" }}
            href={`https://minascan.io/berkeley/tx/${hash}`}
          >
            hash
          </a>
        </p>
      )}
      {address === post.owner && post.isMinted === "0" && map && (
        <Button onClick={async () => await mintNFTClient()}>Mint</Button>
      )}
      <CommentSection messagesQueried={data?.comments} postId={post.id} />
    </Paper>
  );
};

export default MediaDetails;
