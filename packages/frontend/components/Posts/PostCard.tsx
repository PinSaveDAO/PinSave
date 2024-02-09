import type { Post } from "@/services/upload";

import { Paper, Text } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

interface IMyProps {
  post: Post;
}

const PostCard: React.FC<IMyProps> = ({ post }) => {
  return (
    <Link href={`/posts/${post.id}`}>
      <Paper
        component="div"
        withBorder
        radius="lg"
        shadow="md"
        p="md"
        sx={{ cursor: "pointer" }}
      >
        <div
          style={{
            position: "relative",
            height: 200,
          }}
        >
          <Image
            src={post.cid}
            alt={post.name}
            fill
            sizes="200px"
            style={{ objectFit: "cover", borderRadius: "10px" }}
          />
        </div>
        <Text align="center" mt="sm" lineClamp={1}>
          {post.name}
        </Text>
      </Paper>
    </Link>
  );
};

export default PostCard;
