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
      <Center>
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
              height={200}
              width={200}
              sizes="200px"
              style={{ objectFit: "cover", borderRadius: "10px" }}
              loading="lazy"
            />
          </div>
          <Text align="center" mt="sm" lineClamp={1}>
            {post.name}
          </Text>
        </Paper>
      </Center>
    </Link>
  );
};

export default PostCard;
