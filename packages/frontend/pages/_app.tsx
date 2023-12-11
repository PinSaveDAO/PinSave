import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import LayoutApp from "@/components/Layout";
import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from "@livepeer/react";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NextHead from "next/head";
import { useMemo } from "react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { Chain, goerli, optimism } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import type { NextComponentType } from "next";
import type AppProps from "next/app";

type NextAppProps<P = any> = AppProps & {
  pageProps: P;
  Component: NextComponentType & {
    getLayout?: (page: React.ReactElement) => React.ReactNode;
  };
} & Omit<AppProps<P>, "pageProps">;

export interface MyWalletOptions {
  chains: Chain[];
}

const { chains, publicClient } = configureChains(
  [optimism, goerli],
  [
    publicProvider(),
    jsonRpcProvider({
      rpc: (chain) => {
        return { http: chain.rpcUrls.default.http[0] };
      },
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "PinSave",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID as string,
  chains,
});

function MyApp({ Component, pageProps }: NextAppProps) {
  const queryClient = new QueryClient();
  const livepeerClient = useMemo(() => {
    return createReactClient({
      provider: studioProvider({
        apiKey: process.env.NEXT_PUBLIC_LIVEPEER,
      }),
    });
  }, []);

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
  });

  return (
    <MantineProvider
      theme={{
        colorScheme: "light",
        primaryColor: "green",
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={wagmiConfig}>
          <NextHead>
            <title>Pin Save - decentralized Pinterest</title>
          </NextHead>
          <NotificationsProvider>
            <RainbowKitProvider chains={chains}>
              <LivepeerConfig client={livepeerClient}>
                <LayoutApp>
                  <Component {...pageProps} />
                </LayoutApp>
              </LivepeerConfig>
            </RainbowKitProvider>
          </NotificationsProvider>
        </WagmiConfig>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default MyApp;
