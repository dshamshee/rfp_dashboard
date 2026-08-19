"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tenderTable } from "@/lib/db/schema";
import { tenderFormSchema, TenderFormData } from "./zod-type/tender-type";

export async function createTenderAction(data: TenderFormData) {
  try {
    const validatedData = tenderFormSchema.parse(data);

    const [inserted] = await db.insert(tenderTable).values({
      tenderId: validatedData.tenderId || null,
      client: validatedData.client,
      title: validatedData.title,
      location: validatedData.location || null,
      tenderValue: validatedData.tenderValue ?? null,
      emd: validatedData.emd ?? null,
      tenderFee: validatedData.tenderFee ?? null,
      publishDate: validatedData.publishDate,
      preBidDate: validatedData.preBidDate,
      lastDate: validatedData.lastDate,
      openingDate: validatedData.openingDate,
      stage: validatedData.stage || null,
      priority: validatedData.priority || null,
      eligibility: validatedData.eligibility || null,
      technicalStatus: validatedData.technicalStatus || null,
      commercialStatus: validatedData.commercialStatus || null,
      emdStatus: validatedData.emdStatus || null,
      isBidSubmitted: validatedData.isBidSubmitted,
      submissionDate: validatedData.submissionDate,
      expectedResultDate: validatedData.expectedResultDate,
      awardStatus: validatedData.awardStatus || null,
      competitor: validatedData.competitor || null,
      ourQuotation: validatedData.ourQuotation ?? null,
      expectedMargin: validatedData.expectedMargin ?? null,
      expectedMarginRupees: validatedData.expectedMarginRupees ?? null,
      responsiblePerson: validatedData.responsiblePerson || null,
      partner: validatedData.partner || null,
      nextAction: validatedData.nextAction || null,
      nextActionDate: validatedData.nextActionDate || null,
      remarks: validatedData.remarks || null,
    }).returning();

    revalidatePath("/");
    revalidatePath("/new-tender");

    return { success: true, data: inserted };
  } catch (error: any) {
    console.error("Failed to create tender:", error);
    return {
      success: false,
      error: error?.message || "Failed to create tender. Please try again.",
    };
  }
}
