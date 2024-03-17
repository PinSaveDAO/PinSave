import { fetcher } from "@/utils/fetcher";

export const fetchPosts = async ({
  pageParam = 0,
}: { pageParam?: number } = {}) => {
  try {
    return await fetcher(`/api/pages/${pageParam}`);
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

export const fetchPost = async (id: string) => {
  try {
    return await fetcher(`/api/posts/${id}`);
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};
