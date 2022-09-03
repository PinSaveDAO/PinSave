import { ActionIcon, Loader, Paper, SimpleGrid, Image } from "@mantine/core";
import { ArrowLeft } from "tabler-icons-react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { useSigner, useNetwork } from "wagmi";

import { Post } from "../../services/upload";
import { getContractInfo } from "../../utils/contracts";
import NotFoundPage from "../404";

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<Post>();
  const [isLoading, setIsLoading] = useState(true);
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const [img, setImg] = useState<string>();
  const [owner, setOwner] = useState<string>();
  useEffect(() => {
    const fetchPost = async () => {
      if (signer && (chain?.id === 80001 || chain?.id === 22)) {
        const { address, abi } = getContractInfo(chain?.id);

        const contract = new ethers.Contract(address, abi, signer);
        try {
          let res;
          let owner;
          if (chain.id === 22) {
            res = await contract.getPost(id);
            owner = await contract.getPostOwner(id);
          }
          if (chain.id === 80001) {
            res = await contract.tokenURI(id);
            owner = await contract.ownerOf(id);
          }

          setOwner(owner);

          let x = res
            .replace("ipfs://", "https://")
            .replace("sia://", "https://siasky.net/");

          let resURL = x.replace(
            "/metadata.json",
            ".ipfs.dweb.link/metadata.json"
          );
          const item: Post = await fetch(resURL).then((x) => x.json());
          let z, y;
          if (item._data) {
            if (typeof item._data?.image === "string") {
              y = String(item._data?.image).replace("sia://", "");
              z = "siasky.net/" + y;
            } else {
              z = "siasky.net/bABrwXB_uKp6AYEuBk_yxEfSMP7QFKfHQe9KB8AF2nTL2w";
            }
          }
          if (item.image) {
            if (item.image.charAt(0) === "i") {
              y = item.image.replace("ipfs://", "");
              z = y.replace("/", ".ipfs.dweb.link/");
            }
            if (item.image.charAt(0) === "s") {
              y = item.image?.replace("sia://", "");
              z = "siasky.net/" + y;
            }
          }
          setPost(item);
          setImg(`https://${z}`);
        } catch (e) {
          console.log(e);
          setIsLoading(false);
        }
      }
      setIsLoading(false);
    };
    if (signer && !post) fetchPost();
  }, [signer, post, chain, id]);
  if (!signer)
    return (
      <div>
        <h1>Please connect to your wallet</h1>
      </div>
    );
  if (isLoading)
    return (
      <div style={{ textAlign: "center" }}>
        <Loader size="xl" variant="bars" />
      </div>
    );
  if (!isLoading && !post) return <NotFoundPage />;
  return (
    <div>
      <ActionIcon
        onClick={() => router.back()}
        mb="md"
        color="teal"
        size="lg"
        radius="xl"
        variant="filled"
      >
        <ArrowLeft />
      </ActionIcon>
      <SimpleGrid
        breakpoints={[
          { minWidth: "md", cols: 2, spacing: "lg" },
          { maxWidth: "md", cols: 1, spacing: "md" },
        ]}
      >
        <Image src={img} alt="" />
        <Paper shadow="sm" p="md" withBorder>
          <h2 style={{ marginBottom: "1.4rem" }}>
            {post?.name ?? post?._data?.name}
          </h2>
          <h4>Descripton</h4>
          <Paper
            shadow="xs"
            withBorder
            px="sm"
            sx={{ backgroundColor: "#82c7fc1d" }}
          >
            <p>{post?.description ?? post?._data?.description}</p>
          </Paper>
          <p style={{ fontSize: "small", color: "#0000008d" }}>
            Owned by:{" "}
            {chain?.id === 22 ? (
              <a
                style={{ color: "#198b6eb9" }}
                onClick={() => router.push(`/profile/${owner}`)}
              >
                {owner}
              </a>
            ) : (
              <a
                style={{ color: "#198b6eb9" }}
                href={`https://etherscan.io/address/${owner}`}
              >
                {owner}
              </a>
            )}
          </p>
        </Paper>
      </SimpleGrid>
    </div>
  );
};

export default PostPage;
