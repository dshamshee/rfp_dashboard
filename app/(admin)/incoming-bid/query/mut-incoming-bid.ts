import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createIncomingBidAction,
  updateIncomingBidAction,
  deleteIncomingBidAction,
} from "../lib/action";
import { IncomingBidFormData } from "../lib/zod-type/incoming-bid-type";

export function useAddIncomingBidMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IncomingBidFormData) => {
      const res = await createIncomingBidAction(data);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-bids"] });
    },
  });
}

export function useUpdateIncomingBidMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: IncomingBidFormData }) => {
      const res = await updateIncomingBidAction(id, data);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-bids"] });
    },
  });
}

export function useDeleteIncomingBidMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteIncomingBidAction(id);
      if (!res.success) {
        throw new Error(res.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-bids"] });
    },
  });
}
