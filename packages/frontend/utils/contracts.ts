import LSP8PinSaveLatest from "@/contracts/LSP8PinSaveLatest.json";
import PinSaveL8 from "@/contracts/PinSaveL8.json";
import PinSaveOO from "@/contracts/PinSaveOO.json";
import HardhatDeployments from "@/contracts/hardhat_contracts.json";

export function getContractInfo(chain?: number) {
  if (chain === 250)
    return {
      address: "0x3c046f8E210424317A5740CED78877ef0B3EFf4E" as `0x${string}`,
      abi: PinSaveL8.abi,
    };

  if (chain === 314)
    return {
      address: "0xf1926218c9D7c198bB3A4A0fbA989e06a4a97267" as `0x${string}`,
      abi: LSP8PinSaveLatest.abi,
    };

  return {
    address: HardhatDeployments[80001][0].contracts.YourContract
      .address as `0x${string}`,
    abi: HardhatDeployments[80001][0].contracts.YourContract.abi,
  };
}

export function getPinsaveOO() {
  return {
    address: "0xceF2e9fbFfE581daF74c99de0a87CA81F78d4f46" as `0x${string}`,
    abi: PinSaveOO.abi,
  };
}
