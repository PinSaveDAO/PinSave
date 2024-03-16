import {
  Box,
  Button,
  Center,
  Title,
  Text,
  Stack,
  LoadingOverlay,
} from "@mantine/core";
import Link from "next/link";
import type { NextPage } from "next";

import type { Post } from "@/services/upload";
import PostCard from "@/components/Posts/PostCard";
import { usePosts } from "@/hooks/api";
import { PageSEO } from "@/components/SEO";

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
      <PageSEO />
      {posts?.pages.map((page: any, i: number) => (
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
            return <PostCard post={post} key={post.id} />;
          })}
        </Box>
      ))}

      {!posts && isLoading && (
        <Center>
          <Stack
            sx={{
              maxWidth: 700,
            }}
          >
            <Title order={1}>PinSave Home Page</Title>
            <Text>
              Pin Save is a decentralized social media which consists of
              decentralized posts enabled by Mina blockchain and o1js. The speed
              of interacting with media and content should be greatly enhanced
              by storing metadata off-chain enabled by Mina merkle trees. In
              addition, it aims to introduce more standards into the Mina
              ecosystem related to non fungible tokens to improve developer
              experience.
            </Text>
            <Text>
              Upload PinSave Mina post on{" "}
              <Link href="https://pinsave.app/upload">Upload</Link>
            </Text>
            <LoadingOverlay visible />
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
