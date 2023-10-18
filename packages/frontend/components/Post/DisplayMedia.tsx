import type { IndividualPost } from "@/services/upload";
import { IsNotMp4 } from "@/utils/media";
import VideoPlayer from "@/components/Post/VideoPlayer";

import { Image } from "@mantine/core";

const DisplayMedia = (post: IndividualPost) => {
  return (
    <>
      {IsNotMp4(post?.image) ? (
        <Image height={550} fit="contain" src={post.image} alt={post.name} />
      ) : (
        <VideoPlayer {...post} />
      )}
    </>
  );
};

export default DisplayMedia;
