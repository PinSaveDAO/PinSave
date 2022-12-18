import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { useState } from "react";
import Head from "next/head";
import type { AppProps as NextAppProps } from "next/app";
import type { NextComponentType } from "next";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import {
  connectorsForWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { Chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { polygonMumbai, hardhat } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import LayoutApp from "@/components/Layout";

type AppProps<P = any> = NextAppProps & {
  pageProps: P;
  Component: NextComponentType & {
    getLayout?: (page: React.ReactElement) => React.ReactNode;
  };
} & Omit<NextAppProps<P>, "pageProps">;

const LuksoL14Chain: Chain = {
  id: 22,
  name: "L14",
  network: "lukso",
  nativeCurrency: {
    decimals: 18,
    name: "Lukso",
    symbol: "LYXt",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.l14.lukso.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://blockscout.com/lukso/l14",
    },
  },
  testnet: true,
};

const EvmosChain: Chain = {
  id: 9000,
  name: "EVMOS",
  network: "evmos",
  nativeCurrency: {
    decimals: 18,
    name: "EVMOS",
    symbol: "EVMOS",
  },
  rpcUrls: {
    default: {
      http: ["https://eth.bd.evmos.dev:8545"],
    },
  },
  testnet: true,
};

const { chains, provider, webSocketProvider } = configureChains(
  [
    ...(process.env.NEXT_PUBLIC_DEV === "true" ? [hardhat] : []),
    polygonMumbai,
    LuksoL14Chain,
    EvmosChain,
  ],
  [
    alchemyProvider({
      apiKey: String(process.env.NEXT_ALCHEMY_ID),
    }),
    publicProvider(),
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== LuksoL14Chain.id && chain.id !== EvmosChain.id)
          return null;
        return { http: chain.rpcUrls.default.http[0] };
      },
    }),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      rainbowWallet({ chains }),
      metaMaskWallet({ chains }),
    ],
  },
  {
    groupName: "Others",
    wallets: [
      coinbaseWallet({ chains, appName: "My RainbowKit App" }),
      walletConnectWallet({ chains }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <MantineProvider
      theme={{
        colorScheme: "light",
        primaryColor: "green",
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState} />
        <WagmiConfig client={wagmiClient}>
          <Head>
            <title>Pin Save - decentralized Pinterest</title>
            <meta
              name="description"
              content="Pin Save is a platform for decentralized content aggregation and image sharing where users have content ownership."
            />
            <link rel="icon" href="/favicon.svg" />
            <meta
              property="og:image"
              content="https://evm.pinsave.app/PinSaveCard.png"
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
          </Head>
          <NotificationsProvider>
            <RainbowKitProvider chains={chains}>
              <LayoutApp>
                <Component {...pageProps} />
              </LayoutApp>
            </RainbowKitProvider>
          </NotificationsProvider>
        </WagmiConfig>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default MyApp;
