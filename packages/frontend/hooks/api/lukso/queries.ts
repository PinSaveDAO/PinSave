import fetcher from "@/utils/fetcher";

export const luksoKeys = {
  all: ["luksoPosts"] as const,
  single: (id: string) => ["luksoPost", id] as const,
};

export const fetchLuksoPosts = async () => {
  return await fetcher("/api/lukso/l14/posts/");
};

export const fetchLuksoPost = async (id: string) => {
  return await fetcher(`/api/lukso/l14/post/${id}`);
};
