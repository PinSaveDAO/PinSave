import LSP8PinSave from "@/contracts/LSP8PinSave.json";

export function getContractInfo(chain?: number) {
  return {
    address: "0x3c64eE37168c56DD590062d6355F7A2F06511423" as `0x${string}`,
    abi: LSP8PinSave.abi,
  };
}
