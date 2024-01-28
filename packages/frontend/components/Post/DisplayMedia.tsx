import type { IndividualPost } from "@/services/upload";
import { IsNotMp4 } from "@/utils/media";
import VideoPlayer from "@/components/Post/VideoPlayer";

import Image from "next/image";

interface IMyProps {
  post: IndividualPost;
}

const DisplayMedia: React.FC<IMyProps> = ({ post }) => {
  return (
    <>
      {IsNotMp4(post?.cid) ? (
        <Image
          height={600}
          width={550}
          src={post.cid}
          alt={post.name}
          style={{
            width: "99%",
            height: "95%",
            borderRadius: "10px",
          }}
        />
      ) : (
        <VideoPlayer {...post} />
      )}
    </>
  );
};

export default DisplayMedia;
