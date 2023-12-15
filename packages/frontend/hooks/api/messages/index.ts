import { fetchMessages } from "./queries";

import { useQuery } from "@tanstack/react-query";

export const useMessages = (address: string) => {
  return useQuery({
    queryKey: [address],
    queryFn: () => fetchMessages(address),
  });
};
