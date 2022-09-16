import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import Head from "next/head";
import type { AppProps } from "next/app";
import { NotificationsProvider } from "@mantine/notifications";
import {
  connectorsForWallets,
  RainbowKitProvider,
  wallet,
} from "@rainbow-me/rainbowkit";
import {
  Chain,
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

import LayoutApp from "../components/Layout";

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
    default: "https://rpc.l14.lukso.network",
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://blockscout.com/lukso/l14",
    },
  },
  testnet: true,
};

const { chains, provider, webSocketProvider } = configureChains(
  [
    ...(process.env.NEXT_PUBLIC_DEV === "true" ? [chain.hardhat] : []),
    chain.polygonMumbai,
    LuksoL14Chain,
  ],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_ALCHEMY_ID,
    }),
    publicProvider(),
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== LuksoL14Chain.id) return null;
        return { http: chain.rpcUrls.default };
      },
    }),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      wallet.metaMask({ chains }),
      wallet.rainbow({ chains }),
      wallet.walletConnect({ chains }),
      wallet.trust({ chains }),
      wallet.injected({ chains }),
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
  return (
    <WagmiConfig client={wagmiClient}>
      <Head>
        <title>PinSave</title>
        <meta name="description" content="Platform made for posting images" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <NotificationsProvider>
        <RainbowKitProvider chains={chains}>
          <LayoutApp>
            <Component {...pageProps} />
          </LayoutApp>
        </RainbowKitProvider>
      </NotificationsProvider>
    </WagmiConfig>
  );
}

export default MyApp;
