import { useQuery } from "@tanstack/react-query";
import { evmosKeys, fetchEvmosPosts, fetchEvmosPost } from "./queries";
import type { Post } from "@/services/upload";

type IndividualPost = Post & { owner: string };

export const useEvmosPosts = () => {
  return useQuery<Post[]>(evmosKeys.all, () => fetchEvmosPosts());
};

export const useEvmosPost = (id: string) => {
  return useQuery<IndividualPost>(evmosKeys.single(id), () =>
    fetchEvmosPost(id)
  );
};
