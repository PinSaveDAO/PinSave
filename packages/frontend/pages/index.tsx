import { Box, Title } from "@mantine/core";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useSigner, useNetwork, useSwitchNetwork } from "wagmi";
import { ethers } from "ethers";

import { Post } from "../services/upload";
import { getContractInfo } from "../utils/contracts";

import PostCard from "../components/Posts/PostCard";
import Landing from "../components/Landing";

const Home: NextPage = () => {
  const [posts, setPosts] = useState<Array<Post>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const { chains, error, pendingChainId, switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    const fetchPosts = async () => {
      if (signer && (chain?.id === 80001 || chain?.id === 22)) {
        const { address, abi } = getContractInfo(chain.id);

        const contract = new ethers.Contract(address, abi, signer);
        const currentCount = Number(await contract.totalSupply());
        let items: Array<Post> = [];
        let res;
        for (let i = currentCount; i >= currentCount - 40 && i > 0; i--) {
          if (chain.id === 80001) {
            res = await contract.tokenURI(i);
          }
          if (chain.id === 22) {
            res = await contract.getPost(i);
          }

          let x = res
            .replace("ipfs://", "https://")
            .replace("sia://", "https://siasky.net/");

          let resURL = x.replace(
            "/metadata.json",
            ".ipfs.dweb.link/metadata.json"
          );
          try {
            const item = await fetch(resURL).then((x) => x.json());

            items.push({ token_id: i, ...item });
          } catch (e) {
            console.log(e);
          }
        }
        setPosts([...items]);
        setIsLoading(false);
      }
    };
    if (signer && !posts.length) fetchPosts();
  }, [signer, posts.length, chain]);
  if (!signer) return <Landing />;
  if (signer && chain?.id !== 80001 && chain?.id !== 22)
    return (
      <>
        {chain && (
          <div>Connected to {chain.name}; Please, switch to Mumbai or L14</div>
        )}

        {chains.map((x) => (
          <button
            disabled={!switchNetwork || x.id === chain?.id}
            key={x.id}
            onClick={() => switchNetwork?.(x.id)}
          >
            {x.name}
            {isLoading && pendingChainId === x.id && " (switching)"}
          </button>
        ))}
        <div>{error && error.message}</div>
      </>
    );

  if (isLoading) return <Title align="center">Loading...</Title>;
  return (
    <>
      <Box
        mx="auto"
        sx={{
          maxWidth: 1500,
          gap: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 5fr))",
          gridTemplateRows: "masonry",
        }}
      >
        {posts.map((post, i) => {
          let postItem = { ...post, i: posts.length - i };
          return <PostCard {...postItem} key={i} />;
        })}
      </Box>
    </>
  );
};

export default Home;
