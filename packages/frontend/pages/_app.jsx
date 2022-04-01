import { Toaster } from "react-hot-toast";
import { Provider, chain, defaultChains } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import Navigation from "../components/Navigation";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { WalletLinkConnector } from "wagmi/connectors/walletLink";
import AppLayout from "../components/AppLayout";
import "../styles/globals.scss";

const chains = defaultChains;
const infuraId = process.env.NEXT_PUBLIC_INFURA_ID;

const connectors = ({ chainId }) => {
  const rpcUrl =
    chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ??
    chain.mainnet.rpcUrls[0];
  return [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
      options: {
        infuraId,
        qrcode: true,
      },
    }),
    new WalletLinkConnector({
      options: {
        appName: "PinSave",
        jsonRpcUrl: `${rpcUrl}/${infuraId}`,
      },
    }),
  ];
};

function MyApp({ Component, pageProps }) {
  return (
    <Provider autoConnect connectors={connectors}>
      <AppLayout>
        <Navigation />
        <Toaster />
        <Component {...pageProps} />
      </AppLayout>
    </Provider>
  );
}

export default MyApp;
