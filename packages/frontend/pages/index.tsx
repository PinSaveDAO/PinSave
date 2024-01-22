import PostCard from "@/components/Posts/PostCard";
import { usePosts } from "@/hooks/api";
import type { Post } from "@/services/upload";

import { Box, Button, Center, Title, Text, Stack } from "@mantine/core";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const {
    data: posts,
    isFetching: isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts();

  return (
    <div>
      <Center>
        {posts?.pages.map((page, i: number) => (
          <Box
            mx="auto"
            sx={{
              maxWidth: 1500,
              gap: 20,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 5fr))",
              gridTemplateRows: "masonry",
            }}
            key={i}
          >
            {page.items?.map((post: Post) => {
              return <PostCard post={post} key={post.token_id} />;
            })}
          </Box>
        ))}
      </Center>
      {!posts && isLoading && (
        <Center>
          <Stack>
            <Title order={1}> PinSave Home Page</Title>
            <Text> Loading decentralized PinSave Posts</Text>
          </Stack>
        </Center>
      )}
      {posts && posts.pages.length > 0 && (
        <Center my={14}>
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
    </div>
  );
};

export default Home;
