import fetcher from "@/utils/fetcher";
import type { ChainName } from "@/constants/chains";

export const postKeys = {
  byChain: (chain: ChainName) => [chain] as const,
  single: (chain: ChainName, id: string) => [chain, id] as const,
};

export const fetchPosts = async (chain: string, { pageParam = 0 }) => {
  return await fetcher(`/api/${chain}/pages/${pageParam}`);
};

export const fetchPost = async (chain: ChainName, id: string) => {
  return await fetcher(`/api/${chain}/posts/${id}`);
};
