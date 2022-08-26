import HardhatDeployments from "../contracts/hardhat_contracts.json";

import abi from "../contracts/YourContract.json";

export function getContractInfo(chain?: number) {
  if (process.env.NEXT_PUBLIC_DEV === "true")
    return {
      address: HardhatDeployments[31337][0].contracts.YourContract.address,
      abi: HardhatDeployments[31337][0].contracts.YourContract.abi,
    };

  /*   if (chain && chain === 2828)
    return {
      address: 0x18587c47ce8eb3a2ee11bb19b6abc92d6531d285,
      abi: abi,
    }; */

  if (chain && chain === 22)
    return {
      address: "0x18587c47ce8eb3a2ee11bb19b6abc92d6531d285",
      abi: abi.abi,
    };

  return {
    address: HardhatDeployments[80001][0].contracts.YourContract.address,
    abi: HardhatDeployments[80001][0].contracts.YourContract.abi,
  };
}
