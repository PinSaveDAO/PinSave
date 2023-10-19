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
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { NextComponentType } from "next";
import type { AppProps as NextAppProps } from "next/app";
import NextHead from "next/head";
import { useState, useMemo } from "react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { Chain, polygonMumbai, fantom, filecoin } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";

type AppProps<P = any> = NextAppProps & {
  pageProps: P;
  Component: NextComponentType & {
    getLayout?: (page: React.ReactElement) => React.ReactNode;
  };
} & Omit<NextAppProps<P>, "pageProps">;

export interface MyWalletOptions {
  chains: Chain[];
}

const { chains, publicClient } = configureChains(
  [polygonMumbai, fantom, filecoin],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_ALCHEMY_ID,
    }),
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

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
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
      <QueryClientProvider client={queryClient} contextSharing={true}>
        <Hydrate state={pageProps.dehydratedState} />
        <WagmiConfig config={wagmiConfig}>
          <NextHead>
            <title>Pin Save - decentralized Pinterest</title>
            <meta
              name="description"
              content="Pin Save is a platform for decentralized content aggregation and image sharing where users have content ownership."
            />
            <link rel="icon" href="/favicon.svg" />
            <meta
              property="og:image"
              content="https://evm.pinsave.app/CardBlack.png"
            />
            <meta property="og:url" content="https://evm.pinsave.app/" />
            <meta
              property="og:title"
              content="Pin Save - decentralized Pinterest"
            />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:site" content="@pinsav3" />
            <meta name="twitter:creator" content="@pfedprog" />
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
        {/*<ReactQueryDevtools initialIsOpen={false} />*/}
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default MyApp;
