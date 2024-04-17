import type { InferGetStaticPropsType } from "next";
import type { VercelKV } from "@vercel/kv";
import { Box, Button, Center, Title, Loader } from "@mantine/core";
import { useEffect, useState } from "react";
import {
  NFTSerializedData,
  getAppString,
  getVercelNFTAllKeys,
  getVercelMetadataAllKeys,
  getVercelMetadata,
} from "pin-mina";

import type { Post } from "@/services/upload";
import PostCard from "@/components/Posts/PostCard";
import { usePosts } from "@/hooks/api";
import { PageSEO } from "@/components/SEO";
import { getVercelClient } from "@/services/vercelClient";

const perPage: number = 6;

export async function getStaticProps() {
  const client: VercelKV = getVercelClient();
  const appId: string = getAppString();

  const nftSynced: string[] = await getVercelNFTAllKeys(appId, client);
  const nftMetadataSynced: string[] = await getVercelMetadataAllKeys(
    appId,
    client
  );
  if (nftSynced.length !== nftMetadataSynced.length) {
    throw new Error("db not synced");
  }

  const totalInited: number = nftSynced.length;

  let lowerLimit: number = 0;
  let upperLimit: number =
    perPage > totalInited ? totalInited - 1 : perPage - 1;

  let items: NFTSerializedData[] = [];

  for (let index = lowerLimit; upperLimit >= index; index++) {
    const data: NFTSerializedData = await getVercelMetadata(
      appId,
      index,
      client
    );
    items.push({ ...data });
  }
  const posts: NFTSerializedData[] = Array.from(items);
  return {
    props: {
      posts,
    },
  };
}

export default function Home({
  posts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const {
    data: newPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = usePosts();
  const [fetchedPosts, setFetchedPosts] = useState<Post[]>(posts);
  useEffect(() => {
    if (newPosts?.pages) {
      const items = newPosts?.pages;
      const result = Object.keys(items).map((key) => items[Number(key)].items);
      setFetchedPosts([...posts, ...result.flat()]);
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
      {isLoading && (
        <Center mt={24}>
          <Loader color="blue" />
        </Center>
      )}
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
