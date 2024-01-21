import DisplayMedia from "@/components/Post/DisplayMedia";
import { usePost } from "@/hooks/api";

import { ActionIcon, SimpleGrid, LoadingOverlay, Center } from "@mantine/core";
import { useRouter } from "next/router";
import { ArrowLeft } from "tabler-icons-react";

const PostPage = () => {
  const router = useRouter();

  const { data: postQueried, isLoading } = usePost(String(router.query.id));

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
            <Center>
              <DisplayMedia post={postQueried} />
            </Center>
          </SimpleGrid>
        </>
      )}
    </div>
  );
};

export default PostPage;
