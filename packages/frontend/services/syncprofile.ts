import ERC725 from "@/contracts/ERC725.json";
import { updateNotification } from "@mantine/notifications";
import { ethers, Signer } from "ethers";

export type SyncingProfile = {
  signer: Signer;
  address: string;
  chain?: number;
};

export async function UploadPost(incomingData: SyncingProfile) {
  try {
    const contract = new ethers.Contract(
      incomingData.address,
      ERC725.abi,
      incomingData.signer
    );

    console.log(contract.owner());

    updateNotification({
      id: "upload-post",
      color: "teal",
      title: "Post uploaded successfully!!",
      message: "",
    });
  } catch (error) {
    updateNotification({
      id: "upload-post",
      color: "red",
      title: "Failed to upload post",
      message: `${error}`,
    });
  }
}
