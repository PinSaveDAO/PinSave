import { Grid, Title } from "@mantine/core";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { getContractInfo } from "../utils/contracts";
import { useSigner } from "wagmi";
import { ethers } from "ethers";
import { Post } from "../services/upload";
import PostCard from "../components/Posts/PostCard";
import Masonry from "@mui/lab/Masonry";
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
        let x = res.replace("ipfs://", "https://");
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
  if (!signer) return <Title>Please Connect your wallet</Title>;
  if (isLoading) return <Title>Loading...</Title>;
  return (
    <div>
      <Masonry
        columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
        spacing={2}
        defaultHeight={450}
        defaultSpacing={1}
      >
        {posts.map((post, i) => {
          return (
            <div key={i}>
              <PostCard {...post} />
            </div>
          );
        })}
      </Masonry>
    </div>
  );
};

export default Home;
