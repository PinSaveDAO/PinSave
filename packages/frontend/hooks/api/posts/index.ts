import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { postKeys, fetchPosts, fetchPost } from "./queries";

import type { Post } from "@/services/upload";
import type { Chain } from "@/constants/chains";

type IndividualPost = Post & {
  owner: string;
};

export const usePosts = (chain: Chain = "maticmum") => {
  return useInfiniteQuery(
    postKeys.byChain(chain),
    ({ pageParam }) => fetchPosts(chain, { pageParam }),
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.items[5]?.token_id < lastPage.totalSupply) {
          return pages.length;
        }
      },
    }
  );
};

export const usePost = (chain: Chain, id: string) => {
  return useQuery<IndividualPost>(postKeys.single(chain, id), () =>
    fetchPost(chain, id)
  );
};
