import fetcher from "@/utils/fetcher";

export const fetchMessages = async (address: string) => {
  try {
    return await fetcher(`/api/messages/${address}`);
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};
