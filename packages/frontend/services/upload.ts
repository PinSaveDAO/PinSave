import { getContractInfo } from "@/utils/contracts";

import { updateNotification } from "@mantine/notifications";
import {
  randomBytes,
  Contract,
  zeroPadValue,
  hexlify,
  toUtf8Bytes,
} from "ethers";
import { NFTStorage } from "nft.storage";
import { useContractWrite, useWalletClient } from "wagmi";

export type PostData = {
  name: string;
  description: string;
  image: File;
};

export type Post = PostData & {
  image: string;
  token_id: number;
};

export type UploadingPost = {
  receiverAddress: string;
  data: PostData[];
  chain?: number;
  provider?: string;
};

export async function UploadPost(incomingData: UploadingPost) {
  try {
    let metadata_url = [];

    const { address, abi } = getContractInfo(incomingData.chain);

    if (incomingData.provider === "NFT.Storage") {
      const client = new NFTStorage({
        token: process.env.NEXT_PUBLIC_TOKEN,
      });

      for (let i = 0; incomingData.data.length - 1 >= i; i++) {
        const metadata = await client.store({
          ...incomingData.data[i],
        });

        metadata_url.push(metadata.url);
      }
    }

    if (incomingData.provider === "NFTPort") {
      for (let i = 0; incomingData.data.length - 1 >= i; i++) {
        let image_ipfs;

        const formData = new FormData();
        formData.append("file", incomingData.data[i].image);

        const options = {
          method: "POST",
          body: formData,
          headers: {
            Authorization: process.env.NEXT_PUBLIC_NFTPORT,
          },
        };

        const rawResponse = await fetch(
          "https://api.nftport.xyz/v0/files",
          options,
        );
        const content = await rawResponse.json();

        image_ipfs =
          "ipfs://" +
          content.ipfs_url.substring(content.ipfs_url.indexOf("ipfs/") + 5);

        const optionsPost = {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            Authorization: process.env.NEXT_PUBLIC_NFTPORT,
          },
          body: JSON.stringify({
            name: incomingData.data[i].name,
            description: incomingData.data[i].description,
            image: image_ipfs,
          }),
        };
        const rawMetadataResponse = await fetch(
          "https://api.nftport.xyz/v0/metadata",
          optionsPost,
        );
        const metadata = await rawMetadataResponse.json();

        metadata_url.push(metadata.url);
      }
    }

    if (incomingData.provider === "Estuary") {
      for (let i = 0; incomingData.data.length - 1 >= i; i++) {
        let image_ipfs;
        const formData = new FormData();
        formData.append("data", incomingData.data[i].image);

        const rawResponse = await fetch(
          "https://upload.estuary.tech/content/add",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_ESTUARY}`,
            },
            body: formData,
          },
        );

        const content = await rawResponse.json();
        image_ipfs = "ipfs://" + content.cid;

        const formDataJson = new FormData();

        const blob = new Blob(
          [
            JSON.stringify({
              name: incomingData.data[i].name,
              description: incomingData.data[i].description,
              image: image_ipfs,
            }),
          ],
          {
            type: "application/json",
          },
        );
        const files = [new File([blob], "metadata.json")];

        formDataJson.append("data", files[0]);

        const optionsPost = {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ESTUARY}`,
          },
          body: formDataJson,
        };

        const rawMetadataResponse = await fetch(
          "https://upload.estuary.tech/content/add",
          optionsPost,
        );
        const metadata = await rawMetadataResponse.json();

        metadata_url.push("ipfs://" + metadata.cid);
      }
    }

    if (incomingData.chain === 80001) {
      const { write } = useContractWrite({
        address: address,
        abi: abi,
        functionName: "mintPost",
      });

      write({ args: [incomingData.receiverAddress, metadata_url[0]] });
    }

    if (incomingData.chain === 250 || incomingData.chain === 56) {
      try {
        const id = String(randomBytes(32));
        const Id = zeroPadValue(hexlify(toUtf8Bytes(id)), 32);
        const { write } = useContractWrite({
          address: address,
          abi: abi,
          functionName: "createPost",
        });
        write({ args: [incomingData.receiverAddress, metadata_url[0], Id] });
      } catch (e) {
        console.log(e);
      }
    }

    if (
      incomingData.chain === 7700 ||
      incomingData.chain === 5001 ||
      incomingData.chain === 314 ||
      incomingData.chain === 5
    ) {
      let Ids: string[] = [];

      for (let i = 0; metadata_url.length - 1 >= i; i++) {
        const id = String(randomBytes(32));
        const Id = zeroPadValue(hexlify(toUtf8Bytes(id)), 32);
        Ids.push(Id);
      }

      const { write } = useContractWrite({
        address: address,
        abi: abi,
        functionName: "createBatchPosts",
      });
      write({ args: [incomingData.receiverAddress, metadata_url, Ids] });
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
