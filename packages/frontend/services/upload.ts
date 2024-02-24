import { put } from "@vercel/blob";

export type PostData = {
  name: string;
  description: string;
  cid: string;
};

export type Post = PostData & {
  id: number;
};

export type IndividualPost = Post & {
  owner: string;
};

export type UploadingPost = {
  receiverAddress: string;
  name: string;
  description: string;
  image: File;
};

export async function UploadData(image: File) {
  const blobImage = await put(image.name, image, {
    access: "public",
    token: process.env.NEXT_PUBLIC_BLOB,
  });
  const imageUrl = blobImage.url;
  return imageUrl;
}
