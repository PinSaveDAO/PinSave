import type { IndividualPost } from "@/services/upload";

import Image from "next/image";

interface IMyProps {
  post: IndividualPost;
}

const DisplayMedia: React.FC<IMyProps> = ({ post }) => {
  return (
    <>
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
    </>
  );
};

export default DisplayMedia;
