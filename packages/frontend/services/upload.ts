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

export async function UploadData(data: UploadingPost) {
  const isDev = process.env.NEXT_PUBLIC_ISDEV ?? undefined;
  let blob;
  if (isDev) {
    blob = await put(data.image.name, data.image, {
      access: "public",
      token: process.env.NEXT_PUBLIC_BLOB,
    });
  }

  if (!isDev) {
    console.log("production");
    blob = await put(data.image.name, data.image, {
      access: "public",
    });
  }

  return blob;
}
