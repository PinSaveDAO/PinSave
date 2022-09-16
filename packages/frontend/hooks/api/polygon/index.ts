import { useQuery } from "@tanstack/react-query";

import { polygonKeys, fetchPolygonPosts } from "./queries";

export const usePolygonPosts = () => {
  return useQuery(polygonKeys.all, () => fetchPolygonPosts());
};
