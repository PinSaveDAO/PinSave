import create from "zustand";
export const useNetworkStore = create((set) => ({
  // Defaults to Mainnet
  networkName: "Mainnet",
  networkId: "0",
  setNetwork: (networkName, networkId) =>
    set(() => ({ networkId, networkName })),
}));
