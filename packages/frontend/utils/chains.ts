import { CHAINS, type Chain, type ChainId } from "@/constants/chains";

export const getCurrentChain = (chainId: ChainId) => {
  return Object.keys(CHAINS).find(
    (key) => CHAINS[key as keyof typeof CHAINS] === chainId
  ) as Chain;
};
