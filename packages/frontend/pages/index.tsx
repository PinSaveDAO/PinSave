import PostCard from "@/components/Posts/PostCard";
import { usePosts } from "@/hooks/api";
import { getChainApiRouteName } from "@/utils/chains";
import type { Post } from "@/services/upload";
import type { ChainName } from "@/constants/chains";

import { Box, Button, Center, Loader } from "@mantine/core";
import { useNetwork, Chain } from "wagmi";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const { chain } = useNetwork();

  const initialChain: ChainName = getChainApiRouteName(chain as Chain);

  const {
    data: posts,
    isFetching: isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts(initialChain);

  return (
    <>
      {posts?.pages.map((page, i: number) => (
        <Box
          mx="auto"
          sx={{
            maxWidth: 1500,
            gap: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 5fr))",
            gridTemplateRows: "masonry",
          }}
          key={i}
        >
          {page.items.map((post: Post) => {
            return <PostCard {...post} key={post.token_id} />;
          })}
        </Box>
      ))}
      {(isLoading || isFetchingNextPage) && (
        <Center>
          <Loader size="xl" my={4} />
        </Center>
      )}
      {posts && posts?.pages.length > 0 && (
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
      )}
    </>
  );
};

export default Home;
