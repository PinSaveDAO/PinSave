import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import Head from "next/head";
import LayoutApp from "../components/Layout";
const { chains, provider, webSocketProvider } = configureChains(
  [chain.hardhat, chain.polygonMumbai],
  [
    alchemyProvider({
      // This is Alchemy's default API key.
      // You can get your own at https://dashboard.alchemyapi.io
      alchemyId: "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
    }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "RainbowKit App",
  chains,
});

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
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <RainbowKitProvider chains={chains}>
        <LayoutApp>
          <Component {...pageProps} />
        </LayoutApp>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
