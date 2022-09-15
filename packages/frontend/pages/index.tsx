import { Box } from "@mantine/core";
import type { NextPage } from "next";
import { GetStaticProps, InferGetStaticPropsType } from "next";

import { Post } from "services/upload";
import PostCard from "components/Posts/PostCard";

const Home: NextPage = ({
  posts,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <div>
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
        {posts.map((post: any, i: any) => {
          return <PostCard {...post} key={i} />;
        })}
      </Box>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const res = await fetch("https://evm.pinsave.app/api/polygon/posts/1");
  const posts: Array<Post> = await res.json();

  return {
    props: {
      posts,
    },
    revalidate: 10, // In seconds
  };
};

export default Home;
