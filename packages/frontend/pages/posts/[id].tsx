import type { InferGetStaticPropsType, GetStaticProps } from "next";
import type { VercelKV } from "@vercel/kv";
import Link from "next/link";
import { ActionIcon, SimpleGrid } from "@mantine/core";
import { ArrowLeft } from "tabler-icons-react";
import { ParsedUrlQuery } from "querystring";
import {
  NFTSerializedData,
  getAppString,
  getVercelNFTAllKeys,
  getVercelMetadataAllKeys,
  getVercelMetadata,
} from "pin-mina";

import DisplayMedia from "@/components/Post/DisplayMedia";
import MediaDetails from "@/components/Post/MediaDetails";
import { PageSEO } from "@/components/SEO";
import { getVercelClient } from "@/services/vercelClient";

interface IParams extends ParsedUrlQuery {
  id: string;
}

export async function getStaticPaths() {
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
  const paths = Array.from({ length: totalInited }, (_, index) => ({
    params: {
      id: String(index),
    },
  }));
  return {
    paths,
    fallback: "blocking",
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { id: id } = context.params as IParams;
  const client: VercelKV = getVercelClient();
  const appId: string = getAppString();
  const post: NFTSerializedData = await getVercelMetadata(appId, id, client);

  const nftSynced: string[] = await getVercelNFTAllKeys(appId, client);
  const nftMetadataSynced: string[] = await getVercelMetadataAllKeys(
    appId,
    client
  );
  if (nftSynced.length !== nftMetadataSynced.length) {
    throw new Error("db not synced");
  }
  const totalInited: number = nftSynced.length;
  let lastPostId: number = 0;
  if (totalInited > 0) {
    lastPostId = totalInited - 1;
  }
  return {
    props: {
      post,
      lastPostId,
    },
  };
};

const PostPage = ({
  post,
  lastPostId,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const id: number = Number(post.id);
  let prevId: number = lastPostId;
  if (id !== 0) {
    prevId = id - 1;
  }
  return (
    <div>
      <PageSEO
        title={`Pin Save Post ${post.id}`}
        description={`Pin Save Post ${post.id}`}
      />
      <div>
        <Link href={`/posts/${prevId}`}>
          <ActionIcon
            mb="md"
            color="teal"
            size="xl"
            radius="xl"
            variant="filled"
          >
            <ArrowLeft />
          </ActionIcon>
        </Link>
        <SimpleGrid
          breakpoints={[
            { minWidth: "md", cols: 2, spacing: "lg" },
            { maxWidth: "md", cols: 1, spacing: "md" },
          ]}
        >
          <DisplayMedia post={post} />
          <MediaDetails post={post} />
        </SimpleGrid>
      </div>
    </div>
  );
};

export default PostPage;
