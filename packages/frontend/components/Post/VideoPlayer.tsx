import { parseArweaveTxId, parseCid } from "@/services/parseCid";
import type { IndividualPost } from "@/services/upload";

import { Player } from "@livepeer/react";
import { useMemo } from "react";

const VideoPlayer = (post: IndividualPost) => {
  const idParsed = useMemo(
    () => parseCid(post?.cid) ?? parseArweaveTxId(post?.cid),
    [post?.cid]
  );

  return (
    <Player
      title={idParsed}
      src={post.cid}
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
