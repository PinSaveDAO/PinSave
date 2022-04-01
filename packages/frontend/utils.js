import HardhatDeployments from "./contracts/hardhat_contracts.json";
export function getContractInfo() {
  if (process.env.NEXT_PUBLIC_DEV === "true")
    return {
      address:
        HardhatDeployments[31337].localhost.contracts.YourContract.address,
      abi: HardhatDeployments[31337].localhost.contracts.YourContract.abi,
    };
  return {
    address: HardhatDeployments[80001].mumbai.contracts.YourContract.address,
    abi: HardhatDeployments[80001].mumbai.contracts.YourContract.abi,
  };
}
