import fetcher from "@/utils/fetcher";

export const polygonKeys = {
  all: ["polygonPosts"] as const,
  single: (id: string) => ["polygonPost", id] as const,
};

export const fetchPolygonPosts = async () => {
  return await fetcher("/api/polygon/posts/");
};

export const fetchPolygonPost = async (id: string) => {
  return await fetcher(`/api/polygon/post/${id}`);
};
