import fetcher from "@/utils/fetcher";

export const fetchProfile = async (address: string) => {
  try {
    return await fetcher(`/api/profile/${address}`);
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};
