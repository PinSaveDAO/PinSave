import MediaDetails from "@/components/Post/MediaDetails";
import DisplayMedia from "@/components/Post/DisplayMedia";
import { usePost } from "@/hooks/api";
import { getCurrentChain } from "@/utils/chains";

import { ActionIcon, SimpleGrid, LoadingOverlay } from "@mantine/core";
import { useRouter } from "next/router";
import { ArrowLeft } from "tabler-icons-react";
import { ChainName } from "@/constants/chains";

const PostPage = () => {
  const router = useRouter();
  const queryId = String(router.query.id);

  const currentChain: ChainName = getCurrentChain(80001);

  const { data: postQueried, isLoading } = usePost(currentChain, queryId);

  return (
    <div>
      <LoadingOverlay visible={isLoading} />
      {postQueried && (
        <>
          <ActionIcon
            onClick={() => router.back()}
            mb="md"
            color="teal"
            size="xl"
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
            <DisplayMedia post={postQueried} />
            <MediaDetails post={postQueried} currentChain={currentChain} />
          </SimpleGrid>
        </>
      )}
    </div>
  );
};

export default PostPage;
