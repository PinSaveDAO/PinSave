import { CHAINS, type ChainName } from "@/constants/chains";
import { Chain } from "wagmi";

export const getCurrentChain = (chainId: number) => {
  return Object.keys(CHAINS).find(
    (key) => CHAINS[key as keyof typeof CHAINS] === chainId,
  ) as ChainName;
};

export function getChainApiRouteName(chain: Chain): ChainName {
  if ([5, 56, 250, 5001, 80001].includes(chain?.id)) {
    return chain.network as ChainName;
  }

  if (chain?.id === 314) {
    return "filecoin";
  }

  return "fantom";
}
