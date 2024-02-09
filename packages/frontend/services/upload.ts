export type PostDataUpload = {
  name: string;
  description: string;
  image: File;
};

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
  data: PostDataUpload;
};

export async function UploadData(data: UploadingPost) {
  console.log(data.data);
}
