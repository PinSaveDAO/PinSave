import { useEffect, useState } from "react";

import { Box } from "@mantine/core";
import type { NextPage } from "next";

import { Post } from "@/services/upload";
import PostCard from "@/components/Posts/PostCard";

const Home: NextPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/polygon/posts/5");
        const posts: Array<Post> = await res.json();
        setPosts(posts);
      } catch (error: any) {
        setError(error.message);
      }
    })();
  }, []);

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
        {error ||
          posts?.map((post: any, i: any) => {
            return <PostCard {...post} key={i} />;
          })}
      </Box>
    </div>
  );
};

export default Home;
