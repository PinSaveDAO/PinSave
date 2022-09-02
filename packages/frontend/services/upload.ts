import { ethers, Signer } from "ethers";
import { NFTStorage } from "nft.storage";
import { getContractInfo } from "../utils/contracts";
import { updateNotification } from "@mantine/notifications";

import { SkynetClient } from "skynet-js";

export type PostData = {
  name: string;
  description: string;
  image: File;
  _data?: {
    name: string;
    description: string;
    image: string;
  };
};

export type Post = PostData & {
  image: string;
  token_id: number;
};

export async function uploadPostSkynet(
  signer: Signer,
  accAddress: string,
  data: PostData,
  chain?: number
) {
  try {
    const { address, abi } = getContractInfo(chain);
    const contract = new ethers.Contract(address, abi, signer);

    const portal = "https://siasky.net";
    const client = new SkynetClient(portal);

    const metadata = { ...data };

    const { skylink } = await client.uploadFile(metadata.image);
    console.log(skylink);

    const skData = {
      name: metadata.name,
      description: metadata.description,
      image: skylink,
    };

    const blob = new Blob([JSON.stringify(skData)], {
      type: "application/json",
    });
    console.log(blob);
    const file = new File([blob], "metadata.json");

    const completedSkylink = await client.uploadFile(file);
    console.log(completedSkylink.skylink);

    if (chain != 22) {
      await contract.mintPost(accAddress, completedSkylink.skylink);
    }
    if (chain === 22) {
      const id = ethers.BigNumber.from(ethers.utils.randomBytes(32));
      const Id = ethers.utils.hexZeroPad(
        ethers.BigNumber.from(id).toHexString(),
        32
      );
      await contract.createPost(completedSkylink.skylink, Id);
    }

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

export async function uploadPost(
  signer: Signer,
  accAddress: string,
  data: PostData,
  chain?: number
) {
  try {
    const { address, abi } = getContractInfo(chain);
    const contract = new ethers.Contract(address, abi, signer);

    const client = new NFTStorage({
      token: process.env.NEXT_PUBLIC_TOKEN ?? "",
    });

    const metadata = await client.store({
      ...data,
    });

    if (chain != 22) {
      await contract.mintPost(accAddress, metadata.url);
    }

    if (chain === 22) {
      try {
        const id = ethers.BigNumber.from(ethers.utils.randomBytes(32));
        const Id = ethers.utils.hexZeroPad(
          ethers.BigNumber.from(id).toHexString(),
          32
        );
        const token = await contract.createPost(metadata.url, Id);
        token.wait();
        console.log(token);
      } catch (e) {
        console.log(e);
      }
    }

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
