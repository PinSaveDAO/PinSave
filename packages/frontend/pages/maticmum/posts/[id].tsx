import {
  ActionIcon,
  Paper,
  SimpleGrid,
  Image,
  LoadingOverlay,
} from "@mantine/core";
import { ArrowLeft } from "tabler-icons-react";
import { useRouter } from "next/router";
import { parseArweaveTxId, parseCid } from "livepeer/media";
import { useMemo } from "react";
import { Player } from "@livepeer/react";
import { usePost } from "@/hooks/api";
import { getCurrentChain } from "@/utils/chains";

const PostPage = () => {
  const router = useRouter();
  const currentChain = getCurrentChain(80001);

  const { data: post, isLoading } = usePost(
    currentChain,
    router.query.id as string
  );

  const idParsed = useMemo(
    () => parseCid(post?.image) ?? parseArweaveTxId(post?.image),
    [post?.image]
  );

  function checkType(id: string | undefined) {
    if (id && id.slice(-1) === "4") {
      return true;
    }
    return false;
  }

  return (
    <div>
      <LoadingOverlay visible={isLoading} />
      {post && (
        <>
          <ActionIcon
            onClick={() => router.back()}
            mb="md"
            color="teal"
            size="lg"
            radius="xl"
            variant="filled"
          >
            <ArrowLeft />
          </ActionIcon>
          <SimpleGrid
            breakpoints={[
              { minWidth: "md", cols: 2, spacing: "lg" },
              { maxWidth: "md", cols: 1, spacing: "md" },
            ]}
          >
            {checkType(post.image) === false ? (
              <Image
                src={post.image ?? "https://evm.pinsave.app/PinSaveCard.png"}
                alt={post.name}
              />
            ) : (
              <Player
                title={idParsed?.id}
                src={post.image}
                autoPlay
                muted
                autoUrlUpload={{
                  fallback: true,
                  ipfsGateway: "https://w3s.link",
                }}
              />
            )}

            <Paper shadow="sm" p="md" withBorder>
              <h2 style={{ marginBottom: "1.4rem" }}>{post.name}</h2>
              <h4>Description</h4>
              <Paper
                shadow="xs"
                withBorder
                px="sm"
                sx={{ backgroundColor: "#82c7fc1d" }}
              >
                <p>{post.description}</p>
              </Paper>
              <p style={{ fontSize: "small", color: "#0000008d" }}>
                Owned by:{" "}
                <a
                  style={{ color: "#198b6eb9" }}
                  href={`https://etherscan.io/address/${post.owner}`}
                >
                  {post.owner}
                </a>
              </p>
              <div
                style={{
                  fontSize: "medium",
                  color: "#0000008d",
                  padding: "10px",
                }}
              >
                Transactions:{" "}
                <span
                  style={{
                    color: "#198b6eb9",
                  }}
                >
                  {post.nTransactions}
                </span>
              </div>

              {post.date ? (
                <div
                  style={{
                    fontSize: "medium",
                    color: "#0000008d",
                    padding: "10px",
                  }}
                >
                  Minted:{" "}
                  <span
                    style={{
                      color: "#198b6eb9",
                    }}
                  >
                    {new Date(post.date).toUTCString()}
                  </span>
                </div>
              ) : null}
            </Paper>
          </SimpleGrid>
        </>
      )}
    </div>
  );
};

export default PostPage;
