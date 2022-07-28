import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import Head from "next/head";
import LayoutApp from "../components/Layout";
import { NotificationsProvider } from "@mantine/notifications";
const { chains, provider, webSocketProvider } = configureChains(
  [
    ...(process.env.NEXT_PUBLIC_DEV === "true" ? [chain.hardhat] : []),
    chain.polygonMumbai,
  ],
  [
    alchemyProvider({
      // This is Alchemy's default API key.
      // You can get your own at https://dashboard.alchemyapi.io
      alchemyId:
        process.env.NEXT_PUBLIC_ALCHEMY ?? "WmSjTjlKqH-UP69pveZ8zrwJljFXJChZ",
    }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "PinSave",
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
