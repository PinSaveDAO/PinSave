import { Box, Button, Center, LoadingOverlay } from "@mantine/core";
import type { NextPage } from "next";
import { useNetwork } from "wagmi";

import { usePosts } from "@/hooks/api";
import PostCard from "@/components/Posts/PostCard";
import type { Chain } from "@/constants/chains";

const Home: NextPage = () => {
  const { chain } = useNetwork();
  var initialChain = "fantom";
  if (chain?.id === 22) {
    initialChain = "lukso";
  }
  if (chain?.id === 80001) {
    initialChain = "polygon";
  }

  const {
    data: posts,
    isFetching: isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts(initialChain as Chain);

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
        {posts?.pages.map((page) => (
          <>
            {page.items.map((post: any, i: number) => {
              return <PostCard {...post} key={page + i} />;
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
