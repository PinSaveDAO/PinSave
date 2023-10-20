import { randomBytes, zeroPadValue, hexlify, toUtf8Bytes } from "ethers";
import { NFTStorage } from "nft.storage";

export type PostDataUpload = {
  name: string;
  description: string;
  image: File;
};

export type PostData = {
  name: string;
  description: string;
  image: string;
};

export type Post = PostData & {
  token_id: number;
};

export type IndividualPost = Post & {
  owner: string;
};

export type UploadingPost = {
  receiverAddress: `0x${string}`;
  data: PostDataUpload;
  provider?: string;
};

export async function UploadData(incomingData: UploadingPost) {
  let metadata_url;

  if (incomingData.provider === "NFT.Storage") {
    const client = new NFTStorage({
      token: process.env.NEXT_PUBLIC_TOKEN,
    });

    const metadata = await client.store({
      ...incomingData.data,
    });

    metadata_url = metadata.url;
  }

  if (incomingData.provider === "NFTPort") {
    let image_ipfs;

    const formData = new FormData();
    formData.append("file", incomingData.data.image);

    const options = {
      method: "POST",
      body: formData,
      headers: {
        Authorization: process.env.NEXT_PUBLIC_NFTPORT,
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
        Authorization: process.env.NEXT_PUBLIC_NFTPORT,
      },
      body: JSON.stringify({
        name: incomingData.data.name,
        description: incomingData.data.description,
        image: image_ipfs,
      }),
    };
    const rawMetadataResponse = await fetch(
      "https://api.nftport.xyz/v0/metadata",
      optionsPost
    );
    const metadata = await rawMetadataResponse.json();

    metadata_url = metadata.url;
  }

  if (incomingData.provider === "Estuary") {
    let image_ipfs;
    const formData = new FormData();
    formData.append("data", incomingData.data.image);

    const rawResponse = await fetch("https://upload.estuary.tech/content/add", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ESTUARY}`,
      },
      body: formData,
    });

    const content = await rawResponse.json();
    image_ipfs = "ipfs://" + content.cid;

    const formDataJson = new FormData();

    const blob = new Blob(
      [
        JSON.stringify({
          name: incomingData.data.name,
          description: incomingData.data.description,
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

    metadata_url = "ipfs://" + metadata.cid;
  }
  return metadata_url;
}

/* export function UploadPost(
  incomingData: UploadingPost,
  metadata_url: string[]
) {
  const { address, abi } = getContractInfo(incomingData.chain);

  const { write: writeCreatePost } = useContractWrite({
    address: address,
    abi: abi,
    functionName: "createPost",
  });

  const { write: writeCreateBatchPosts } = useContractWrite({
    address: address,
    abi: abi,
    functionName: "createBatchPosts",
  });

  const { config } = usePrepareContractWrite({
    address: address,
    abi: abi,
    functionName: "mintPost",
    args: [incomingData.receiverAddress, metadata_url[0]],
  });

  const { write: writeMintPost } = useContractWrite(config);
  try {

    if (incomingData.chain === 250) {
      try {
        const id = String(randomBytes(32));
        const Id = zeroPadValue(hexlify(toUtf8Bytes(id)), 32);
        writeCreatePost({
          args: [incomingData.receiverAddress, metadata_url[0], Id],
        });
      } catch (e) {
        console.log(e);
      }
    }

    if (incomingData.chain === 314) {
      let Ids: string[] = [];

      for (let i = 0; metadata_url.length - 1 >= i; i++) {
        const id = String(randomBytes(32));
        const Id = zeroPadValue(hexlify(toUtf8Bytes(id)), 32);
        Ids.push(Id);
      }

      writeCreateBatchPosts({
        args: [incomingData.receiverAddress, metadata_url, Ids],
      });
    }

} */
