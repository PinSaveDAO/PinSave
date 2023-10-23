import LSP8PinSave from "@/contracts/LSP8PinSave.json";

export function getContractInfo(chain?: number) {
  if (chain === 10)
    return {
      address: "0x40F320CD3Cd616E59599568c4eA011E2eE49a175" as `0x${string}`,
      abi: LSP8PinSave.abi,
    };

  return {
    address: "0x3c64eE37168c56DD590062d6355F7A2F06511423" as `0x${string}`,
    abi: LSP8PinSave.abi,
  };
}
