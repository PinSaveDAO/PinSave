import HardhatDeployments from "../contracts/hardhat_contracts.json";
import PinSaveL8 from "../contracts/PinSaveL8.json";

export function getContractInfo(chain?: number) {
  if (process.env.NEXT_PUBLIC_DEV === "true")
    return {
      address: HardhatDeployments[31337][0].contracts.YourContract.address,
      abi: HardhatDeployments[31337][0].contracts.YourContract.abi,
    };

  if (chain === 22)
    return {
      address: "0x5787604E0E4F7710C4c34c8B40371549C63D2dFF",
      abi: PinSaveL8.abi,
    };

  return {
    address: HardhatDeployments[80001][0].contracts.YourContract.address,
    abi: HardhatDeployments[80001][0].contracts.YourContract.abi,
  };
}
