import { createContext } from "react";
import { WebBundlr } from "@bundlr-network/client";

interface CurrentUserContextType {
  initialiseBundlr: Function;
  bundlrInstance: WebBundlr | undefined;
  balance: string | undefined;
  fetchBalance: Function;
}

export const MainContext = createContext<CurrentUserContextType>(
  {} as CurrentUserContextType
);
