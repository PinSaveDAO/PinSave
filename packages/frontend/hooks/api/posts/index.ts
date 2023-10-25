import { postKeys, fetchPosts, fetchPost } from "./queries";
import type { ChainName } from "@/constants/chains";
import type { IndividualPost } from "@/services/upload";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

export const usePosts = (chain: ChainName) => {
  return useInfiniteQuery(
    postKeys.byChain(chain),
    ({ pageParam }) => fetchPosts(chain, { pageParam }),
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.items[5]?.token_id < lastPage.totalSupply) {
          return pages.length;
        }
      },
    },
  );
};

export const usePost = (chain: ChainName, id: string) => {
  return useQuery<IndividualPost>(postKeys.single(chain, id), () =>
    fetchPost(chain, id),
  );
};
