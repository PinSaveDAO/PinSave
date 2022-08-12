import {
  Paper,
  Text,
  Title,
  Popover,
  Image,
  Container,
  Loader,
} from "@mantine/core";
import React, { useState } from "react";
import { Post } from "../../services/upload";

const PostCard = (post: Post) => {
  const [opened, setOpened] = useState(false);

  let y;
  let x;

  if (post._data) {
    console.log(typeof post._data?.image);
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
    <Popover
      opened={opened}
      onClose={() => setOpened(false)}
      position="top"
      placement="center"
      trapFocus={false}
      closeOnEscape={false}
      transition="pop-bottom-left"
      styles={{ body: { pointerEvents: "none" } }}
      target={
        <Paper
          onMouseEnter={() => setOpened(true)}
          onMouseLeave={() => setOpened(false)}
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
      }
    >
      <Container sx={{ maxWidth: "400px" }}>
        <Title align="center">{post.name ? post.name : post._data?.name}</Title>
        <Text>
          {post.description ? post.description : post._data?.description}
        </Text>
      </Container>
    </Popover>
  );
};

export default PostCard;
