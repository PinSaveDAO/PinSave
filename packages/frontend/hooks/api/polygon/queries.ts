import { fetcher } from "utils";

export const polygonKeys = {
  all: ["polygonPosts"] as const,
};

export const fetchPolygonPosts = async () => {
  return await fetcher("/api/polygon/posts");
};
