import { ActionIcon, Paper, SimpleGrid, Image } from "@mantine/core";
import { ArrowLeft } from "tabler-icons-react";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { GetStaticProps, InferGetStaticPropsType } from "next";

import { Post } from "@/services/upload";

interface IParams extends ParsedUrlQuery {
  id: string;
}

const PostPage = ({ post }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  return (
    <div>
      <ActionIcon
        onClick={() => router.back()}
        mb="md"
        color="teal"
        size="lg"
        radius="xl"
        variant="filled"
      >
        <ArrowLeft />
      </ActionIcon>
      <SimpleGrid
        breakpoints={[
          { minWidth: "md", cols: 2, spacing: "lg" },
          { maxWidth: "md", cols: 1, spacing: "md" },
        ]}
      >
        <Image src={post.image} alt="" />
        <Paper shadow="sm" p="md" withBorder>
          <h2 style={{ marginBottom: "1.4rem" }}>
            {post.name ?? post._data.name}
          </h2>
          <h4>Descripton</h4>
          <Paper
            shadow="xs"
            withBorder
            px="sm"
            sx={{ backgroundColor: "#82c7fc1d" }}
          >
            <p>{post.description ?? post._data.description}</p>
          </Paper>
          <p style={{ fontSize: "small", color: "#0000008d" }}>
            Owned by:{" "}
            <a
              style={{ color: "#198b6eb9" }}
              href={`https://etherscan.io/address/${post.owner}`}
            >
              {post.owner}
            </a>
          </p>
        </Paper>
      </SimpleGrid>
    </div>
  );
};

export const getStaticPaths = async () => {
  const res = await fetch("https://evm.pinsave.app/api/polygon/posts/1");
  const posts: Array<Post> = await res.json();
  const paths = posts.map((post) => ({
    params: { id: String(post.token_id) },
  }));
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params as IParams;
  const res = await fetch(`https://evm.pinsave.app/api/polygon/post/${id}`);
  const post: Array<Post> = await res.json();
  return {
    props: {
      post,
    },
    revalidate: 10, // In seconds
  };
};

export default PostPage;
