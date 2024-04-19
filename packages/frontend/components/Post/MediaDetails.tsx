import { Paper, Text, Title, Button, Group } from "@mantine/core";
import { MerkleMap, PublicKey, Signature, fetchAccount } from "o1js";
import { useEffect, useState } from "react";
import {
  deserializeJsonToMerkleMap,
  getAppVars,
  createTxOptions,
  deserializeNFT,
  startBerkeleyClient,
  createMintTxFromMap,
} from "pin-mina";

import type { IndividualPost } from "@/services/upload";
import { setMinaAccount } from "@/hooks/minaWallet";
import { fetcher } from "@/utils/fetcher";
import { useAddressContext } from "context";
import CommentSection from "./CommentSection";

interface IMyProps {
  post: IndividualPost;
}

const MediaDetails: React.FC<IMyProps> = ({ post }) => {
  const postNumber = Number(post.id);
  const { address, setAddress } = useAddressContext();

  const [map, setMap] = useState<MerkleMap | undefined>(undefined);
  const [hash, setHash] = useState<string | undefined>(undefined);

  async function mintNFTClient() {
    if (!address) {
      setAddress(await setMinaAccount());
    }
    if (map && address) {
      startBerkeleyClient();
      const compile = true;
      const { appPubString: appId, appContract: appContract } = getAppVars();
      const dataNft = await fetcher(`/api/nft/${postNumber}`);
      const nft = deserializeNFT(dataNft);
      await fetchAccount({ publicKey: appId });
      const adminSignatureData = await fetch(`/api/mint/adminSignature/`, {
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
      console.log(sendTransactionResult);
      setHash(sendTransactionResult.hash);
      await fetch(`/api/mint/uploadData/`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ postNumber: postNumber }),
      });
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
    <Paper shadow="lg" p="xl" ml="md" mr="md" withBorder>
      <Title mb="1.4rem">{post.name}</Title>
      <Paper
        shadow="xs"
        withBorder
        px="xs"
        sx={{ backgroundColor: "#20c7fc1d" }}
      >
        <Text my={2}>{post.description}</Text>
      </Paper>
      <Text px="xs" mt="xs" sx={{ fontSize: "small", color: "#0000008d" }}>
        Owned by:{" "}
        <a
          style={{ color: "#198b6eb9" }}
          href={`https://minascan.io/berkeley/account/${post.owner}`}
        >
          {post.owner.substring(0, 8) + "..." + post.owner.substring(45)}
        </a>
      </Text>
      {hash && (
        <div style={{ fontSize: "small", color: "#0000008d" }}>
          <a
            style={{ color: "#198b6eb9" }}
            href={`https://minascan.io/berkeley/tx/${hash}`}
          >
            hash
          </a>
        </div>
      )}
      <Group>
        {address === post.owner && post.isMinted === "0" && map ? (
          <Button mt="sm" onClick={async () => await mintNFTClient()}>
            Mint
          </Button>
        ) : (
          <Button
            mt="sm"
            disabled={address !== post.owner || post.isMinted === "1" || !map}
          >
            Mint
          </Button>
        )}
        <Button mt="sm" disabled>
          Supply NFT
        </Button>
        <Paper mt="sm">Ask by a holder</Paper>
        <Button mt="sm" disabled>
          Purchase
        </Button>
      </Group>
      <CommentSection postId={post.id} />
    </Paper>
  );
};

export default MediaDetails;
