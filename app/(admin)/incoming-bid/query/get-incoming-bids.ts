import { useQuery } from "@tanstack/react-query";
import { getIncomingBidsAction } from "../lib/action";

export function useGetIncomingBidsQuery() {
  return useQuery({
    queryKey: ["incoming-bids"],
    queryFn: async () => {
      const res = await getIncomingBidsAction();
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
  });
}
