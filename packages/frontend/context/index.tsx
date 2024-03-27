import {
  useState,
  useEffect,
  createContext,
  useContext,
  PropsWithChildren,
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
  useEffect(() => {
    const savedAddress = sessionStorage.getItem("auroWalletAddress");
    if (savedAddress && savedAddress !== "undefined") {
      setAddress(savedAddress);
    }
  }, []);
  return (
    <AddressContext.Provider value={{ address, setAddress }}>
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
