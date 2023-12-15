import { fetchProfile } from "./queries";

import { useQuery } from "@tanstack/react-query";

export const useProfile = (address: string) => {
  return useQuery({
    queryKey: [address],
    queryFn: () => fetchProfile(address),
  });
};
