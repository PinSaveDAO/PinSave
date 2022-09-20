import { useQuery } from "@tanstack/react-query";
import { postKeys, fetchPosts, fetchPost } from "./queries";

import type { Post } from "@/services/upload";
import type { Chain } from "@/constants/constants";

type IndividualPost = Post & { owner: string };

export const usePosts = (chain: Chain) => {
  return useQuery<Post[]>(postKeys.byChain(chain), () => fetchPosts(chain));
};

export const usePolygonPost = (chain: Chain, id: string) => {
  return useQuery<IndividualPost>(postKeys.single(chain, id), () =>
    fetchPost(chain, id)
  );
};
