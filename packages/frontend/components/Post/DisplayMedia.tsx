import { Center } from "@mantine/core";
import Image from "next/image";

import type { IndividualPost } from "@/services/upload";

interface IMyProps {
  post: IndividualPost;
}

const DisplayMedia: React.FC<IMyProps> = ({ post }) => {
  return (
    <Center>
      <Image
        height={700}
        width={500}
        src={post.cid}
        alt={post.name}
        style={{
          width: "95%",
          borderRadius: "10px",
        }}
      />
    </Center>
  );
};

export default DisplayMedia;
