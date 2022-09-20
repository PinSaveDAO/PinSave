import fetcher from "@/utils/fetcher";

import type { Chain } from "@/constants/chains";

export const postKeys = {
  byChain: (chain: Chain) => [chain] as const,
  single: (chain: Chain, id: string) => [chain, id] as const,
};

export const fetchPosts = async (chain: Chain) => {
  return await fetcher(`/api/${chain}/posts`);
};

export const fetchPost = async (chain: Chain, id: string) => {
  return await fetcher(`/api/${chain}/posts/${id}`);
};
