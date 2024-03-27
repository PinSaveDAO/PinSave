import { fetchComments } from "./queries";

import { useQuery } from "@tanstack/react-query";

export const useComments = (post: string | number) => {
  return useQuery({
    queryKey: [post],
    queryFn: () => fetchComments(post),
    refetchInterval: 1000,
  });
};
