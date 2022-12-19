import { Box, LoadingOverlay } from "@mantine/core";
import type { NextPage } from "next";
import { useNetwork } from "wagmi";

import { usePosts } from "@/hooks/api";
import PostCard from "@/components/Posts/PostCard";
import type { Chain } from "@/constants/chains";

const Home: NextPage = () => {
  const { chain } = useNetwork();
  var initialChain = "polygon" as Chain;
  if (chain?.id === 22) {
    initialChain = "lukso";
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
        {posts?.pages.map((page) => (
          <>
            {page.map((post: any, i: number) => {
              return <PostCard {...post} key={page + i} />;
            })}
          </>
        ))}

        <div>
          <button
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
          >
            {isFetchingNextPage
              ? "Loading more..."
              : hasNextPage
              ? "Load More"
              : "Nothing more to load"}
          </button>
        </div>
      </Box>
    </>
  );
};

export default Home;
