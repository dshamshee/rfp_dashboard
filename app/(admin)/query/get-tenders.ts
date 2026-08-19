import { useQuery } from "@tanstack/react-query";
import { getTendersAction } from "../lib/action";

export function useGetTendersQuery(initialData?: any[]) {
  return useQuery({
    queryKey: ["tenders"],
    queryFn: async () => {
      const res = await getTendersAction();
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    initialData,
  });
}
