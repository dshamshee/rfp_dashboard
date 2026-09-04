import { z } from "zod";

export const incomingBidFormSchema = z.object({
  Department: z.string().min(1, { message: "Department is required" }),
  bidDetails: z.string().min(1, { message: "Bid details are required" }),
  oemDetails: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
  publicationDate: z.date({
    message: "Expected publication date is required",
  }),
});

export type IncomingBidFormData = z.infer<typeof incomingBidFormSchema>;
