import { Box, LoadingOverlay } from "@mantine/core";
import type { NextPage } from "next";
import { useNetwork } from "wagmi";

import { usePosts } from "@/hooks/api";
import PostCard from "@/components/Posts/PostCard";
import { getCurrentChain } from "@/utils/chains";

const Home: NextPage = () => {
  const { chain } = useNetwork();
  const currentChain = getCurrentChain(chain?.id as number);
  const { data: posts, isLoading } = usePosts(currentChain);

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
        {posts?.map((post: any, i: any) => {
          return <PostCard {...post} key={i} />;
        })}
      </Box>
    </div>
  );
};

export default Home;
