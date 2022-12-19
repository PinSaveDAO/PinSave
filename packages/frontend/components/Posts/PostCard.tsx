import Image from "next/image";
import Link from "next/link";
import { Paper, Text } from "@mantine/core";
import { useNetwork } from "wagmi";

import type { Post } from "@/services/upload";

const PostCard = (post: Post) => {
  const { chain } = useNetwork();
  let y, x;

  if (post.image?.charAt(0) === "i") {
    y = post.image.replace("ipfs://", "");
    x = y.replace("/", ".ipfs.dweb.link/");
  }
  if (post.image?.charAt(0) === "s") {
    y = post.image.replace("sia://", "");
    x = "siasky.net/" + y;
  }

  function loadPosts(chain: any) {
    if ([22, 9000, 80001, 31337].includes(chain?.id)) {
      return chain.network;
    } else {
      return "maticmum";
    }
  }
  const imgSrc = `https://${x ?? "evm.pinsave.app/PinSaveCard.png"}`;

  return (
    <Link href={`/${loadPosts(chain)}/posts/${post.token_id}`}>
      <Paper
        component="a"
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
            src={imgSrc}
            alt={post.name}
            placeholder="blur"
            fill
            blurDataURL={imgSrc}
            sizes="200px"
            style={{ objectFit: "cover" }}
          />
        </div>
        <Text align="center" mt="sm">
          {post.name}
        </Text>
      </Paper>
    </Link>
  );
};

export default PostCard;
