import { Paper, Text, Center } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

import type { Post } from "@/services/upload";

interface IMyProps {
  post: Post;
}

const PostCard: React.FC<IMyProps> = ({ post }) => {
  return (
    <Link href={`/posts/${post.id}`} className="fade-in">
      <Paper
        component="div"
        withBorder
        radius="lg"
        shadow="md"
        p="md"
        sx={{ cursor: "pointer" }}
      >
        <Image
          src={post.cid}
          alt={post.name}
          height={200}
          width={200}
          sizes="200px"
          style={{
            objectFit: "cover",
            borderRadius: "10px",
            width: "100%",
          }}
          loading="lazy"
        />
        <Text align="center" mt="sm" lineClamp={1}>
          {post.name}
        </Text>
      </Paper>
    </Link>
  );
};

export default PostCard;
