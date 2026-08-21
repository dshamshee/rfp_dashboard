import { z } from "zod";

export const tenderFormSchema = z.object({
  tenderId: z.string().optional(),
  client: z.string().min(1, { message: "Client name is required" }),
  title: z.string().min(1, { message: "Tender title is required" }),
  state: z.string().optional(),
  district: z.string().optional(),
  tenderValue: z.coerce.number().optional(),
  emd: z.coerce.number().optional(),
  tenderFee: z.coerce.number().optional(),
  publishDate: z.date({
    message: "Publish date is required",
  }),
  preBidDate: z.date({
    message: "Pre-bid date is required",
  }),
  lastDate: z.date({
    message: "Last date is required",
  }),
  openingDate: z.date({
    message: "Opening date is required",
  }),
  stage: z.string().optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"], {
    message: "Priority must be HIGH, MEDIUM, or LOW",
  }).optional(),
  eligibility: z.enum(["ELIGIBLE", "NOT ELIGIBLE"], {
    message: "Eligibility must be ELIGIBLE or NOT ELIGIBLE",
  }).optional(),
  technicalStatus: z.string().optional(),
  commercialStatus: z.string().optional(),
  emdStatus: z.string().optional(),
  isBidSubmitted: z.boolean(),
  submissionDate: z.date({
    message: "Submission date is required",
  }),
  expectedResultDate: z.date({
    message: "Expected result date is required",
  }),
  awardStatus: z.string().optional(),
  competitor: z.string().optional(),
  ourQuotation: z.coerce.number().optional(),
  expectedMargin: z.coerce.number().optional(),
  expectedMarginRupees: z.coerce.number().optional(),
  responsiblePerson: z.string().optional(),
  partner: z.string().optional(),
  nextAction: z.string().optional(),
  nextActionDate: z.date().optional().nullable(),
  remarks: z.string().optional(),
  documentUrl: z.string().optional().nullable(),
  insertedBy: z.enum(["MANUAL", "AI"]).default("MANUAL"),
});

export type TenderFormData = z.infer<typeof tenderFormSchema>;
