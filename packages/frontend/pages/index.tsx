import { Box, Title } from "@mantine/core";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { getContractInfo } from "../utils/contracts";
import { useSigner } from "wagmi";
import { ethers } from "ethers";
import { Post } from "../services/upload";

import PostCard from "../components/Posts/PostCard";
import Landing from "../components/Landing";

//import Masonry from "@mui/lab/Masonry";

const Home: NextPage = () => {
  const [posts, setPosts] = useState<Array<Post>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: signer } = useSigner();
  const fetchPosts = async () => {
    if (signer) {
      const { address, abi } = getContractInfo();
      const contract = new ethers.Contract(address, abi, signer);
      const currentCount = Number(await contract.totalSupply());
      let items: Array<Post> = [];
      for (let i = currentCount; i >= currentCount - 40 && i > 0; i--) {
        const res: string = await contract.tokenURI(i);
        let x = res
          .replace("ipfs://", "https://")
          .replace("sia://", "https://siasky.net/");

        let resURL = x.replace(
          "/metadata.json",
          ".ipfs.dweb.link/metadata.json"
        );
        const item = await fetch(resURL).then((x) => x.json());
        items.push({ token_id: i, ...item });
      }
      setPosts([...items]);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (signer && !posts.length) fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer]);
  if (!signer) return <Landing />;
  if (isLoading) return <Title align="center">Loading...</Title>;
  return (
    <div>
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
          return (
            <div key={i}>
              <PostCard {...post} />
            </div>
          );
        })}
      </Box>
    </div>
  );
};

export default Home;
