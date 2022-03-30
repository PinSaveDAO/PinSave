import { Toaster } from "react-hot-toast";
import { Provider, chain, defaultChains } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { WalletLinkConnector } from "wagmi/connectors/walletLink";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navigation, Home, Upload, Post } from "./components";

const chains = defaultChains;
const infuraId = process.env.REACT_APP_INFURA_ID;

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
      }
    }),
    new WalletLinkConnector({
      options: {
        appName: "PinSave",
        jsonRpcUrl: `${rpcUrl}/${infuraId}`,
      },
    }),
  ];
};
const App = () => {

  return (
    <Provider autoConnect connectors={connectors}>
      <Router>
        <Navigation />
        <Toaster />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/post/:token_id" element={<Post />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
