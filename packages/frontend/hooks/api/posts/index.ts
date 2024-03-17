import { fetchPosts, fetchPost } from "./queries";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

export const usePosts = () => {
  return useInfiniteQuery({
    queryKey: ["mina"],
    queryFn: async ({ pageParam }: { pageParam?: number | undefined }) => {
      const data = await fetchPosts({ pageParam });
      return data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: any, pages: any) => {
      if (
        lastPage.items &&
        lastPage.items.at(-1).id < lastPage.totalSupply - 1
      ) {
        return pages.length;
      }
    },
  });
};

export const usePost = (id: string) => {
  return useQuery({
    queryKey: [id],
    queryFn: () => fetchPost(id),
  });
};
