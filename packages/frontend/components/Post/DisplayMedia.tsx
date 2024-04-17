import { Center } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Image from "next/image";
import { useEffect, useState } from "react";

import type { IndividualPost } from "@/services/upload";

interface IMyProps {
  post: IndividualPost;
}

const DisplayMedia: React.FC<IMyProps> = ({ post }) => {
  const [hasMounted, setHasMounted] = useState(false);
  const xlScreen = useMediaQuery("(min-width: 2000px)");
  const largeScreen = useMediaQuery("(min-width: 700px)");
  const height = xlScreen ? 1200 : largeScreen ? 600 : 300;
  const width = xlScreen ? 800 : largeScreen ? 600 : 200;
  useEffect(() => {
    setHasMounted(true);
  });
  return (
    <Center>
      {hasMounted && (
        <Image
          height={height}
          width={width}
          src={post.cid}
          alt={post.name}
          style={{
            height: "95%",
            borderRadius: "10px",
          }}
        />
      )}
    </Center>
  );
};

export default DisplayMedia;
