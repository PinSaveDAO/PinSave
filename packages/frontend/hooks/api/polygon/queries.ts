import fetcher from "@/utils/fetcher";

export const polygonKeys = {
  all: ["polygonPosts"] as const,
};

export const fetchPolygonPosts = async () => {
  return await fetcher("/api/polygon/posts/5");
};
