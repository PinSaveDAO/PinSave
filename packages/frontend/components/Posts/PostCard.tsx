import { IsNotMp4 } from "@/utils/media";
import type { Post } from "@/services/upload";

import { Player } from "@livepeer/react";
import { Paper, Text } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

interface IMyProps {
  post: Post;
}

const PostCard: React.FC<IMyProps> = ({ post }) => {
  return (
    <Link href={`/posts/${post.token_id}`}>
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
          {IsNotMp4(post.cid) ? (
            <Image
              src={post.cid}
              alt={post.name}
              fill
              sizes="200px"
              style={{ objectFit: "cover", borderRadius: "10px" }}
            />
          ) : (
            <Player
              src={post.cid}
              muted
              autoUrlUpload={{
                fallback: true,
                ipfsGateway: "https://w3s.link",
              }}
              aspectRatio="1to1"
            />
          )}
        </div>
        <Text align="center" mt="sm" lineClamp={1}>
          {post.name}
        </Text>
      </Paper>
    </Link>
  );
};

export default PostCard;
