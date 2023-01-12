import type { NextPage } from "next";
import { useNetwork } from "wagmi";
import { Box, Button, Center, LoadingOverlay } from "@mantine/core";

import { usePosts } from "@/hooks/api";
import PostCard from "@/components/Posts/PostCard";
import type { ChainName } from "@/constants/chains";
import type { Post } from "@/services/upload";

const Home: NextPage = () => {
  var initialChain: ChainName = "fantom";
  const { chain } = useNetwork();

  if (
    chain &&
    chain.id &&
    (chain.id === 80001 || chain.id === 250 || chain.id === 56)
  ) {
    initialChain = chain.network as ChainName;
  }

  const {
    data: posts,
    isFetching: isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts(initialChain);

  return (
    <>
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
        {posts &&
          posts.pages.map((page) => (
            <>
              {page.items.map((post: Post, i: number) => {
                return <PostCard {...post} key={i} />;
              })}
            </>
          ))}
      </Box>
      <Center my={8}>
        <Button
          mx="auto"
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage
            ? "Loading more..."
            : hasNextPage
            ? "Load More"
            : "Nothing more to load"}
        </Button>
      </Center>
    </>
  );
};

export default Home;
