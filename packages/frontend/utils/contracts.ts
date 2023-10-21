import HardhatDeployments from "@/contracts/hardhat_contracts.json";

export function getContractInfo(chain?: number) {
  return {
    address: HardhatDeployments[80001][0].contracts.YourContract
      .address as `0x${string}`,
    abi: HardhatDeployments[80001][0].contracts.YourContract.abi,
  };
}
