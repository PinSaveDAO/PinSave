import { Box, LoadingOverlay } from "@mantine/core";
import type { NextPage } from "next";

import { usePolygonPosts } from "@/hooks/api";
import PostCard from "@/components/Posts/PostCard";

const Home: NextPage = () => {
  const { data: polygonPosts, isLoading } = usePolygonPosts();

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
        {polygonPosts?.map((post: any, i: any) => {
          return <PostCard {...post} key={i} />;
        })}
      </Box>
    </div>
  );
};

export default Home;
