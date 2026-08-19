import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTenderAction } from "../lib/action";
import { TenderFormData } from "../lib/zod-type/tender-type";

export function useAddTenderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TenderFormData) => {
      const res = await createTenderAction(data);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
    },
  });
}
