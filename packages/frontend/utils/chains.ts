import { CHAINS, type ChainName } from "@/constants/chains";
import type { Chain } from "wagmi";

export const getCurrentChain = (chainId: number) => {
  return Object.keys(CHAINS).find(
    (key) => CHAINS[key as keyof typeof CHAINS] === chainId
  ) as ChainName;
};

export function getChainApiRouteName(chain: Chain): ChainName {
  return "maticmum";
}
