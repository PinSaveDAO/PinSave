import LSP8PinSave from "@/contracts/LSP8PinSave.json";
import PinSave from "@/contracts/PinSave.json";
import PinSaveL8 from "@/contracts/PinSaveL8.json";
import HardhatDeployments from "@/contracts/hardhat_contracts.json";

export function getContractInfo(chain?: number) {
  if (process.env.NEXT_PUBLIC_DEV === "true")
    return {
      address: HardhatDeployments[31337][0].contracts.YourContract.address,
      abi: HardhatDeployments[31337][0].contracts.YourContract.abi,
    };

  if (chain === 56)
    return {
      address: "0xf1926218c9D7c198bB3A4A0fbA989e06a4a97267",
      abi: PinSaveL8.abi,
    };

  if (chain === 250)
    return {
      address: "0x3c046f8E210424317A5740CED78877ef0B3EFf4E",
      abi: PinSaveL8.abi,
    };

  if (chain === 5001)
    return {
      address: "0x7dc43b28aaa88Ff1a280c05E5A113F23FF10d28b",
      abi: PinSave.abi,
    };

  if (chain === 7700)
    return {
      address: "0xC379129e9D617D6833D582bFc8C703a7b2858904",
      abi: LSP8PinSave.abi,
    };

  return {
    address: HardhatDeployments[80001][0].contracts.YourContract.address,
    abi: HardhatDeployments[80001][0].contracts.YourContract.abi,
  };
}
