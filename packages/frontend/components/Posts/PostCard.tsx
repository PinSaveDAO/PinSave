import Image from "next/image";
import Link from "next/link";
import { Paper, Text } from "@mantine/core";
import { useNetwork } from "wagmi";
import { useMemo } from "react";
import { parseArweaveTxId, parseCid } from "livepeer/media";
import { Player } from "@livepeer/react";

import type { Post } from "@/services/upload";

const PostCard = (post: Post) => {
  const { chain } = useNetwork();
  let y, x;

  const idParsed = useMemo(
    () => parseCid(post.image) ?? parseArweaveTxId(post.image),
    [post.image]
  );

  function checkType(id: string | undefined) {
    if (id && id.slice(-1) === "4") {
      return true;
    }
    return false;
  }

  if (post.image.charAt(0) === "i") {
    y = post.image.replace("ipfs://", "");
    x = y.replace("/", ".ipfs.dweb.link/");
  }

  function loadPosts(chain: any) {
    if ([22, 250, 9000, 80001, 31337].includes(chain.id)) {
      return String(chain.network);
    }
    if (chain.id === 80001) {
      return "maticmum";
    }
    return "fantom";
  }
  console.log(post);

  const imgSrc = `https://${x ?? "evm.pinsave.app/PinSaveCard.png"}`;

  return (
    <Link href={`/${loadPosts(chain)}/posts/${post.token_id}`}>
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
        <Text align="center" mt="sm">
          {post.name}
        </Text>
      </Paper>
    </Link>
  );
};

export default PostCard;
