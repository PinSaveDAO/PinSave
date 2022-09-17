import Image from "next/future/image";
import { Paper, Text } from "@mantine/core";
import { useRouter } from "next/router";

import type { Post } from "@/services/upload";

const PostCard = (post: Post) => {
  const router = useRouter();

  let y;
  let x;

  if (post._data) {
    if (typeof post._data?.image === "string") {
      y = String(post._data?.image).replace("sia://", "");
      x = "siasky.net/" + y;
    } else {
      x = "siasky.net/bABrwXB_uKp6AYEuBk_yxEfSMP7QFKfHQe9KB8AF2nTL2w";
    }
  }
  if (post.image) {
    if (post.image.charAt(0) === "i") {
      y = post.image.replace("ipfs://", "");
      x = y.replace("/", ".ipfs.dweb.link/");
    }
    if (post.image.charAt(0) === "s") {
      y = post.image?.replace("sia://", "");
      x = "siasky.net/" + y;
    }
  }

  const imgSrc = `https://${x}`;

  return (
    <Paper
      onClick={() => router.push(`/polygon/posts/${post.token_id}`)}
      withBorder
      radius="lg"
      shadow="md"
      p="md"
      sx={{ cursor: "pointer" }}
    >
      <div
        style={{
          position: "relative",
          width: 200,
          height: 200,
        }}
      >
        <Image
          src={imgSrc}
          alt={post.name ? post.name : post._data?.name ?? "Image"}
          placeholder="blur"
          blurDataURL={imgSrc}
          fill
          sizes="200px"
          style={{ objectFit: "cover" }}
        />
      </div>
      <Text align="center" mt="sm">
        {post.name ? post.name : post._data?.name}
      </Text>
    </Paper>
  );
};

export default PostCard;
