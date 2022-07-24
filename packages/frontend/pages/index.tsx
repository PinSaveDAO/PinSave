import { Grid, Title, Text, Image, Paper } from "@mantine/core";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { getContractInfo } from "../utils/contracts";
import { useSigner } from "wagmi";
import { ethers } from "ethers";
import { Post } from "../services/upload";
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
  }, [signer]);
  if (isLoading) return <Title>Loading...</Title>;
  return (
    <div>
      <Grid>
        {posts.map((post, i) => {
          let y = post.image.replace("ipfs://", "");
          const x = y.replace("/", ".ipfs.dweb.link/");
          return (
            <Grid.Col xs={4} key={i} mx="auto">
              <Paper withBorder radius="lg" shadow="md" p="md">
                <Image
                  radius="lg"
                  alt={post.name}
                  src={`https://${x}`}
                  sx={{ maxWidth: "500px" }}
                />
                <Text align="center" mt="sm">
                  {post.name}
                </Text>
              </Paper>
            </Grid.Col>
          );
        })}
      </Grid>
    </div>
  );
};

export default Home;
