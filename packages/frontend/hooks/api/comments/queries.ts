import { fetcher } from "@/utils/fetcher";

export const fetchComments = async (post: string | number) => {
  const query = `/api/comments/${post}`;
  try {
    return await fetcher(query);
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};
