import type { Post } from "@/services/upload";
import { Player } from "@livepeer/react";
import { Paper, Text } from "@mantine/core";
import { parseCid } from "livepeer/media";
import Image from "next/image";
import Link from "next/link";
import { useNetwork } from "wagmi";
import { Chain } from "wagmi";

const PostCard = (post: Post) => {
  const { chain } = useNetwork();

  function checkType(id: string | undefined) {
    if (id && id.slice(-3) === "mp4") {
      return true;
    }
    return false;
  }

  function loadPosts(chain: Chain) {
    if ([56, 250, 5001, 7700, 80001].includes(chain?.id)) {
      return chain.network;
    }
    return "maticmum";
  }

  let imgSrc = "https://evm.pinsave.app/PinSaveCard.png";
  if (post.image) {
    if (post.image.charAt(0) === "i") {
      imgSrc = "https://ipfs.io/ipfs/" + parseCid(post.image)?.id;
    }
    if (post.image.charAt(0) === "h") {
      imgSrc = post.image;
    }
  }

  return (
    <Link href={`/${loadPosts(chain as Chain)}/posts/${post.token_id}`}>
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
              src={imgSrc}
              alt={post.name}
              placeholder="blur"
              fill
              blurDataURL={imgSrc}
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
