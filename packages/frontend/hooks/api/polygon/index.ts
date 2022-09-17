import { useQuery } from "@tanstack/react-query";
import { polygonKeys, fetchPolygonPosts, fetchPolygonPost } from "./queries";
import type { Post } from "@/services/upload";

type IndividualPost = Post & { owner: string };

export const usePolygonPosts = () => {
  return useQuery<Post[]>(polygonKeys.all, () => fetchPolygonPosts());
};

export const usePolygonPost = (id: string) => {
  return useQuery<IndividualPost>(polygonKeys.single(id), () =>
    fetchPolygonPost(id)
  );
};
