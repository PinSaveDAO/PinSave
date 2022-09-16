import { useQuery } from "@tanstack/react-query";
import { polygonKeys, fetchPolygonPosts } from "./queries";
import type { Post } from "@/services/upload";

export const usePolygonPosts = () => {
  return useQuery<Post[]>(polygonKeys.all, () => fetchPolygonPosts());
};
