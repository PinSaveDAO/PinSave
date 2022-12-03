import HardhatDeployments from "@/contracts/hardhat_contracts.json";
import PinSaveL8 from "@/contracts/PinSaveL8.json";

export function getContractInfo(chain?: number) {
  if (process.env.NEXT_PUBLIC_DEV === "true")
    return {
      address: HardhatDeployments[31337][0].contracts.YourContract.address,
      abi: HardhatDeployments[31337][0].contracts.YourContract.abi,
    };

  if (chain === 22)
    return {
      address: "0x9c49Ebc7F0da23F71D7d0e73c0885694EA05492A",
      abi: PinSaveL8.abi,
    };

  if (chain === 9000)
    return {
      address: "0xF46FCAb2404b071ac33e5eD2095802Cecf77FB21",
      abi: PinSaveL8.abi,
    };

  return {
    address: HardhatDeployments[80001][0].contracts.YourContract.address,
    abi: HardhatDeployments[80001][0].contracts.YourContract.abi,
  };
}
