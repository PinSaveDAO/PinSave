import { useQuery } from "@tanstack/react-query";
import { luksoKeys, fetchLuksoPosts, fetchLuksoPost } from "./queries";
import type { Post } from "@/services/upload";

type IndividualPost = Post & { owner: string };

export const useLuksoPosts = () => {
  return useQuery<Post[]>(luksoKeys.all, () => fetchLuksoPosts());
};

export const useLuksoPost = (id: string) => {
  return useQuery<IndividualPost>(luksoKeys.single(id), () =>
    fetchLuksoPost(id)
  );
};
