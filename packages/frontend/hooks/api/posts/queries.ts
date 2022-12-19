import fetcher from "@/utils/fetcher";

import type { Chain } from "@/constants/chains";

export const postKeys = {
  byChain: (chain: Chain) => [chain] as const,
  single: (chain: Chain, id: string) => [chain, id] as const,
};

export const fetchPosts = async (chain: string, { pageParam = 0 }) => {
  return await fetcher(
    `/api/${chain}/${chain === "lukso" ? "l14/" : ""}/pages/${pageParam}`
  );
};

export const fetchPost = async (chain: Chain, id: string) => {
  return await fetcher(
    `/api/${chain}/${chain === "lukso" ? "l14/" : ""}posts/${id}`
  );
};
