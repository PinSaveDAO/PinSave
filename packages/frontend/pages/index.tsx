import { Box, Button, Center, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { nftDataIn } from "pin-mina";

import type { Post } from "@/services/upload";
import PostCard from "@/components/Posts/PostCard";
import { usePosts } from "@/hooks/api";
import { PageSEO } from "@/components/SEO";

type dataIn = {
  items: nftDataIn[];
  totalSupply: number;
  page: number;
};

export async function getStaticProps() {
  const res = await fetch("https://pinsave.app/api/pages/0");
  const posts = await res.json();
  return {
    props: {
      posts,
    },
  };
}

export default function Home({ ...posts }: dataIn) {
  const data = Array.from(posts.items);
  const {
    data: newPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts();
  const [fetchedPosts, setFetchedPosts] = useState<Post[]>(data);

  useEffect(() => {
    if (newPosts?.pages) {
      const items = newPosts?.pages;
      const result = Object.keys(items).map((key) => items[Number(key)].items);
      setFetchedPosts([...data, ...result.flat()]);
    }
  }, [newPosts]);
  return (
    <div>
      <PageSEO />
      <Title order={1} className="fade-in-text">
        PinSave Home Page
      </Title>
      <Box
        mx="auto"
        mt={20}
        sx={{
          maxWidth: 1500,
          gap: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 5fr))",
          gridTemplateRows: "masonry",
        }}
      >
        {fetchedPosts?.map((post: Post) => {
          return <PostCard post={post} key={post.id} />;
        })}
      </Box>

      {newPosts && newPosts?.pages?.length > 0 && (
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
}
