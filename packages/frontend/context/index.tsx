import {
  useState,
  useEffect,
  createContext,
  useContext,
  PropsWithChildren,
  useMemo,
} from "react";

type AddressContextType = {
  address: string;
  setAddress: (address: string) => void;
};

export const AddressContext = createContext<AddressContextType | undefined>(
  undefined
);

export const AddressProvider = ({ children }: PropsWithChildren<{}>) => {
  const [address, setAddress] = useState<string>("");

  const addressProviderValue = useMemo(
    () => ({ address, setAddress }),
    [address, setAddress]
  );

  useEffect(() => {
    const savedAddress = sessionStorage.getItem("auroWalletAddress");
    if (savedAddress && savedAddress !== "undefined") {
      setAddress(savedAddress);
    }
  }, []);

  return (
    <AddressContext.Provider value={addressProviderValue}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddressContext = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error("AddressContext must be used inside the AddressProvider");
  }
  return context;
};
