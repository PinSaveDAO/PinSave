import { ethers, Signer } from "ethers";
import { NFTStorage } from "nft.storage";
import { getContractInfo } from "../utils/contracts";
import { updateNotification } from "@mantine/notifications";
export type PostData = {
  name: string;
  description: string;
  image: File;
};
export type Post = PostData & {
  image: string;
};
export async function uploadPost(
  signer: Signer,
  accAddress: string,
  data: PostData
) {
  try {
    const { address, abi } = getContractInfo();
    const contract = new ethers.Contract(address, abi, signer);
    const client = new NFTStorage({
      token: process.env.NEXT_PUBLIC_TOKEN ?? "",
    });
    const metadata = await client.store({
      ...data,
    });
    await contract.mintPost(accAddress, metadata.url);
    updateNotification({
      id: "upload-post",
      color: "teal",
      title: "Post uploaded successfully!!",
      message: "",
    });
  } catch {
    updateNotification({
      id: "upload-post",
      color: "red",
      title: "Failed to upload post",
      message: "",
    });
  }
}
