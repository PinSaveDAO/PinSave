import { ethers, Signer } from "ethers";
import { NFTStorage } from "nft.storage";
import { updateNotification } from "@mantine/notifications";
import { WebBundlr } from "@bundlr-network/client";

import { getContractInfo } from "@/utils/contracts";
import { dataStream } from "@/utils/stream";

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
  data: PostData[],
  chain?: number,
  provider?: string,
  bundlrInstance?: WebBundlr
) {
  try {
    let metadata_url = [];
    const { address, abi } = getContractInfo(chain);
    const contract = new ethers.Contract(address, abi, signer);

    if (provider === "NFT.Storage") {
      const client = new NFTStorage({
        token: process.env.NEXT_PUBLIC_TOKEN as string,
      });

      for (let i = 0; data.length - 1 >= i; i++) {
        const metadata = await client.store({
          ...data[i],
        });

        metadata_url.push(metadata.url);
      }
    }

    if (provider === "NFTPort") {
      for (let i = 0; data.length - 1 >= i; i++) {
        let image_ipfs;

        const formData = new FormData();
        formData.append("file", data[i].image);

        const options = {
          method: "POST",
          body: formData,
          headers: {
            Authorization: process.env.NEXT_PUBLIC_NFTPORT as string,
          },
        };

        const rawResponse = await fetch(
          "https://api.nftport.xyz/v0/files",
          options
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
            Authorization: process.env.NEXT_PUBLIC_NFTPORT as string,
          },
          body: JSON.stringify({
            name: data[i].name,
            description: data[i].description,
            image: image_ipfs,
          }),
        };
        const rawMetadataResponse = await fetch(
          "https://api.nftport.xyz/v0/metadata",
          optionsPost
        );
        const metadata = await rawMetadataResponse.json();

        metadata_url.push(metadata.url);
      }
    }

    if (provider === "Estuary") {
      for (let i = 0; data.length - 1 >= i; i++) {
        let image_ipfs;
        const formData = new FormData();
        formData.append("data", data[i].image);

        const rawResponse = await fetch(
          "https://upload.estuary.tech/content/add",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_ESTUARY}`,
            },
            body: formData,
          }
        );

        const content = await rawResponse.json();
        image_ipfs = "ipfs://" + content.cid;

        const formDataJson = new FormData();

        const blob = new Blob(
          [
            JSON.stringify({
              name: data[i].name,
              description: data[i].description,
              image: image_ipfs,
            }),
          ],
          {
            type: "application/json",
          }
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
          optionsPost
        );
        const metadata = await rawMetadataResponse.json();

        metadata_url.push("ipfs://" + metadata.cid);
      }
    }

    if (provider === "Arweave" && bundlrInstance) {
      for (let i = 0; data.length - 1 >= i; i++) {
        let uploader = bundlrInstance.uploader.chunkedUploader;
        let uploader1 = bundlrInstance.uploader.chunkedUploader;
        const transactionOptions = {
          tags: [{ name: "Content-Type", value: data[i].image.type }],
        };

        const dataBuffer = dataStream(data[i].image);
        let response = await uploader.uploadData(
          dataBuffer,
          transactionOptions
        );

        const transactionOptionsMetadata = {
          tags: [{ name: "Content-Type", value: "application/json" }],
        };

        const obj = {
          name: data[i].name,
          description: data[i].description,
          image: "https://arweave.net/" + response.data.id,
        };

        const blob = new Blob([JSON.stringify(obj)], {
          type: "application/json",
        });
        const files = [new File([blob], "metadata.json")];

        const dataBuffer0 = dataStream(files[0]);
        let response0 = await uploader1.uploadData(
          dataBuffer0,
          transactionOptionsMetadata
        );

        console.log("https://arweave.net/" + response0.data.id);
        metadata_url.push("https://arweave.net/" + response0.data.id);
      }
    }

    if (chain === 80001) {
      await contract.mintPost(accAddress, metadata_url[0]);
    }

    if (chain === 250 || chain === 56) {
      try {
        const id = ethers.BigNumber.from(ethers.utils.randomBytes(32));
        const Id = ethers.utils.hexZeroPad(
          ethers.BigNumber.from(id).toHexString(),
          32
        );
        const token = await contract.createPost(
          accAddress,
          metadata_url[0],
          Id
        );
        token.wait();
        console.log(token);
      } catch (e) {
        console.log(e);
      }
    }

    console.log(chain);

    if (chain === 7700) {
      console.log(metadata_url);
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
