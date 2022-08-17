import { Paper, Text, Image, Loader } from "@mantine/core";
import { useRouter } from "next/router";
import React from "react";
import { Post } from "../../services/upload";

const PostCard = (post: Post) => {
  const router = useRouter();

  let y;
  let x;

  if (post._data) {
    //console.log(typeof post._data?.image);
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
    //console.log(post.image);
  }

  return (
    <Paper
      onClick={() => router.push(`/posts/${post.token_id}`)}
      withBorder
      radius="lg"
      shadow="md"
      p="md"
    >
      <Image
        radius="lg"
        alt={post.name ? post.name : post._data?.name}
        withPlaceholder
        placeholder={<Loader size="lg" />}
        src={`https://${x}`}
        sx={{ maxWidth: 300 }}
      />
      <Text align="center" mt="sm">
        {post.name ? post.name : post._data?.name}
      </Text>
    </Paper>
  );
};

export default PostCard;
