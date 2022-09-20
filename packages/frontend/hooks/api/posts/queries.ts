import fetcher from "@/utils/fetcher";

import type { Chain } from "@/constants/constants";

export const postKeys = {
  byChain: (chain: Chain) => ["posts", chain] as const,
  single: (chain: Chain, id: string) => ["post", chain, id] as const,
};

export const fetchPosts = async (chain: Chain) => {
  return await fetcher(`/api/${chain}/posts`);
};

export const fetchPost = async (chain: Chain, id: string) => {
  return await fetcher(`/api/${chain}/post/${id}`);
};
