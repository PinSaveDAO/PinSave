import { parseArweaveTxId, parseCid } from "@/services/parseCid";
import type { IndividualPost } from "@/services/upload";

import { Player } from "@livepeer/react";
import { useMemo } from "react";

const VideoPlayer = (post: IndividualPost) => {
  const idParsed = useMemo(
    () => parseCid(post?.image) ?? parseArweaveTxId(post?.image),
    [post?.image]
  );

  return (
    <Player
      title={idParsed}
      src={post.image}
      autoPlay
      muted
      autoUrlUpload={{
        fallback: true,
        ipfsGateway: "https://w3s.link",
      }}
    />
  );
};

export default VideoPlayer;
