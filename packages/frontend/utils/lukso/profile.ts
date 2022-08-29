import KeyManager from "@lukso/universalprofile-smart-contracts/artifacts/LSP6KeyManager.json";
import UP from "@lukso/universalprofile-smart-contracts/artifacts/UniversalProfile.json";

export const createContractsInstance = async (
  profileAddress: string,
  web3: any
) => {
  const profileContract = new web3.eth.Contract(UP.abi, profileAddress);

  const keyManagerAddress = await profileContract.methods.owner().call();
  const keyManagerContract = new web3.eth.Contract(
    KeyManager.abi,
    keyManagerAddress
  );

  return { profileContract, keyManagerContract };
};
