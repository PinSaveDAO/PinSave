import fetcher from "@/utils/fetcher";

export const evmosKeys = {
  all: ["evmosPosts"] as const,
  single: (id: string) => ["evmosPost", id] as const,
};

export const fetchEvmosPosts = async () => {
  return await fetcher("/api/evmos/posts/");
};

export const fetchEvmosPost = async (id: string) => {
  return await fetcher(`/api/evmos/post/${id}`);
};
