import { Box, LoadingOverlay } from "@mantine/core";
import type { NextPage } from "next";
import { useNetwork } from "wagmi";

import { usePolygonPosts, useLuksoPosts } from "@/hooks/api";
import PostCard from "@/components/Posts/PostCard";

const Home: NextPage = () => {
  const { data: polygonPosts, isLoading } = usePolygonPosts();
  const { data: luksoPosts } = useLuksoPosts();
  const { chain } = useNetwork();

  let posts;
  if (chain?.id === 80001) {
    posts = polygonPosts?.map((post: any, i: any) => {
      return <PostCard {...post} key={i} />;
    });
  }
  if (chain?.id === 22) {
    posts = luksoPosts?.map((post: any, i: any) => {
      return <PostCard {...post} key={i} />;
    });
  }
  if (chain?.id !== 22 && chain?.id !== 80001) {
    posts = polygonPosts?.map((post: any, i: any) => {
      return <PostCard {...post} key={i} />;
    });
  }

  return (
    <div>
      <LoadingOverlay visible={isLoading} />
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
        {posts}
      </Box>
    </div>
  );
};

export default Home;
