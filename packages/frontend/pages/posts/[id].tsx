import type { InferGetStaticPropsType, GetStaticProps } from "next";
import Link from "next/link";
import { ActionIcon, SimpleGrid } from "@mantine/core";
import { ArrowLeft } from "tabler-icons-react";
import { ParsedUrlQuery } from "querystring";
import { nftDataIn } from "pin-mina";

import DisplayMedia from "@/components/Post/DisplayMedia";
import MediaDetails from "@/components/Post/MediaDetails";
import { PageSEO } from "@/components/SEO";

interface IParams extends ParsedUrlQuery {
  id: string;
}

export async function getStaticPaths() {
  const res: Response = await fetch("https://pinsave.app/api/totalInited");
  const totalInitedJson: { totalInited: number } = await res.json();
  const totalInited: number = totalInitedJson.totalInited;
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
  const { id } = context.params as IParams;
  const res: Response = await fetch(`https://pinsave.app/api/posts/${id}`);
  const post: nftDataIn = await res.json();
  return {
    props: {
      post,
    },
  };
};

const PostPage = ({ post }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const id: number = Number(post.id);
  let prevId: number = 0;
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
