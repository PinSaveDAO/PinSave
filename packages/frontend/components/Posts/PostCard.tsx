import { getChainApiRouteName } from "@/utils/chains";
import { checkType } from "@/utils/media";
import type { Post } from "@/services/upload";

import { Player } from "@livepeer/react";
import { Paper, Text } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { useNetwork, Chain } from "wagmi";

const PostCard = (post: Post) => {
  const { chain } = useNetwork();

  return (
    <Link
      href={`/${getChainApiRouteName(chain as Chain)}/posts/${post.token_id}`}
    >
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
          {checkType(post.image) === false ? (
            <Image
              src={post.image}
              alt={post.name}
              placeholder="blur"
              fill
              blurDataURL={post.image}
              sizes="200px"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <Player
              src={post.image}
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
