import create from "zustand";

export const useStore = create((set) => ({
  contract: null,
  currentUser: null,
  nearConfig: null,
  wallet: null,
  didcontract: null,
  setUpStore: (contract, currentUser, nearConfig, wallet, didcontract) =>
    set(() => ({
      contract: contract,
      currentUser: currentUser,
      nearConfig: nearConfig,
      wallet: wallet,
      didcontract: didcontract,
    })),
}));
