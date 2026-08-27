import { useQuery } from "@tanstack/react-query";
import { getDiscussionsAction, getDiscussionCountAction, getTenderIdsWithDiscussionsAction } from "../lib/action";

export function useGetDiscussionsQuery(tenderId: string, enabled = true) {
  return useQuery({
    queryKey: ["discussions", tenderId],
    queryFn: async () => {
      const res = await getDiscussionsAction(tenderId);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    enabled: !!tenderId && enabled,
  });
}

export function useGetDiscussionCountQuery() {
  return useQuery({
    queryKey: ["discussion-count"],
    queryFn: async () => {
      const res = await getDiscussionCountAction();
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.count;
    },
  });
}

export function useGetTenderIdsWithDiscussionsQuery() {
  return useQuery({
    queryKey: ["tender-ids-with-discussions"],
    queryFn: async () => {
      const res = await getTenderIdsWithDiscussionsAction();
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
  });
}
