import { postKeys, fetchPosts, fetchPost } from "./queries";
import type { ChainName } from "@/constants/chains";
import type { IndividualPost } from "@/services/upload";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

export const usePosts = (chain: ChainName) => {
  return useInfiniteQuery(["posts", chain], ({ pageParam }) =>
    fetchPosts(chain, { pageParam })
  );
};

export const usePost = (chain: ChainName, id: string) => {
  return useQuery<IndividualPost>(postKeys.single(chain, id), () =>
    fetchPost(chain, id)
  );
};
