import { ethers, Signer } from "ethers";
import { NFTStorage } from "nft.storage";
import { getContractInfo } from "../utils/contracts";
import { updateNotification } from "@mantine/notifications";

import { SkynetClient, genKeyPairFromSeed } from "skynet-js";

export type PostData = {
  name: string;
  description: string;
  image: File;
};

export type skylinkData = {
  name: string;
  description: string;
  image: string;
};

export type Post = PostData & {
  image: string;
};

export async function uploadPostSkynet(
  signer: Signer,
  accAddress: string,
  data: PostData
) {
  try {
    const { address, abi } = getContractInfo();
    const contract = new ethers.Contract(address, abi, signer);

    const portal = "https://siasky.net";
    const client = new SkynetClient(portal);

    const { privateKey } = genKeyPairFromSeed(
      "this seed should be fairly long for security"
    );

    const { publicKey } = genKeyPairFromSeed(
      "this seed should be fairly long for security"
    );

    const dataKey = "myApp";

    const metadata = { ...data };

    const { skylink } = await client.uploadFile(metadata.image);
    console.log(skylink);

    const skData = {
      name: metadata.name,
      description: metadata.description,
      image: skylink,
    };

    await client.db.setJSON(privateKey, dataKey, skData);

    const { dataLink } = await client.db.getJSON(publicKey, dataKey);

    await contract.mintPost(accAddress, dataLink);

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
