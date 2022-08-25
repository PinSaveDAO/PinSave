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

const LuksoChain: Chain = {
  id: 2828,
  name: "L16",
  network: "lukso",
  nativeCurrency: {
    decimals: 18,
    name: "Lukso",
    symbol: "LYXt",
  },
  rpcUrls: {
    default: "https://rpc.l16.lukso.network",
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://explorer.execution.l16.lukso.network",
    },
  },
  testnet: true,
};

const { chains, provider, webSocketProvider } = configureChains(
  [
    ...(process.env.NEXT_PUBLIC_DEV === "true" ? [chain.hardhat] : []),
    chain.polygonMumbai,
    LuksoChain,
  ],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_ALCHEMY_ID,
    }),
    publicProvider(),
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== LuksoChain.id) return null;
        return { http: chain.rpcUrls.default };
      },
    }),
  ]
);

/* const needsInjectedWalletFallback =
  typeof window !== "undefined" &&
  window.ethereum &&
  !window.ethereum.isMetaMask &&
  !window.ethereum.isCoinbaseWallet; */

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      wallet.rainbow({ chains }),
      wallet.walletConnect({ chains }),
      wallet.metaMask({ chains }),
      wallet.trust({ chains }),
      wallet.coinbase({ appName: "PinSave", chains }),
      wallet.injected({ chains }),
      //...(needsInjectedWalletFallback ? [wallet.injected({ chains })] : []),
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
