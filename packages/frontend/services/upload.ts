import { ethers, Signer } from "ethers";
import { NFTStorage } from "nft.storage";
import { updateNotification } from "@mantine/notifications";

import { getContractInfo } from "@/utils/contracts";

export type PostData = {
  name: string;
  description: string;
  image: File;
};

export type Post = PostData & {
  image: string;
  token_id: number;
};

export async function UploadPost(
  signer: Signer,
  accAddress: string,
  data: PostData,
  chain?: number
) {
  try {
    const { address, abi } = getContractInfo(chain);
    const contract = new ethers.Contract(address, abi, signer);

    const client = new NFTStorage({
      token: process.env.NEXT_PUBLIC_TOKEN as string,
    });

    const metadata = await client.store({
      ...data,
    });

    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: process.env.NEXT_PUBLIC_NFTPORT as string,
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        file_url: metadata.data.image.href,
      }),
    };

    (async () => {
      const rawResponse = await fetch(
        "https://api.nftport.xyz/v0/metadata",
        options
      );
      //const content = await rawResponse.json();
    })();

    if (chain === 80001) {
      await contract.mintPost(accAddress, metadata.url);
    }

    if (chain === 22 || chain === 250 || chain === 56) {
      try {
        const id = ethers.BigNumber.from(ethers.utils.randomBytes(32));
        const Id = ethers.utils.hexZeroPad(
          ethers.BigNumber.from(id).toHexString(),
          32
        );
        const token = await contract.createPost(accAddress, metadata.url, Id);
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
