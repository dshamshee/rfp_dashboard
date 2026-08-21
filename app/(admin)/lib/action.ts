"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tenderTable } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function getTendersAction() {
  try {
    const tenders = await db
      .select()
      .from(tenderTable)
      .orderBy(desc(tenderTable.createdAt), desc(tenderTable.id));
    return { success: true, data: tenders };
  } catch (error: any) {
    console.error("SERVER ERROR [getTendersAction]:", error);
    return { success: false, error: "Failed to load tenders. Please refresh the page.", data: [] };
  }
}

export async function toggleBidSubmittedAction(id: string, isBidSubmitted: boolean) {
  try {
    await db
      .update(tenderTable)
      .set({ isBidSubmitted, updatedAt: sql`NOW() AT TIME ZONE 'Asia/Kolkata'` })
      .where(eq(tenderTable.id, id));

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("SERVER ERROR [toggleBidSubmittedAction]:", error);
    return { success: false, error: "Failed to update status. Please try again." };
  }
}

export async function deleteTenderAction(id: string) {
  try {
    await db.delete(tenderTable).where(eq(tenderTable.id, id));
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("SERVER ERROR [deleteTenderAction]:", error);
    return { success: false, error: "Failed to delete tender. Please try again." };
  }
}

export async function updateTenderAction(id: string, data: any) {
  try {
    const [updated] = await db
      .update(tenderTable)
      .set({
        tenderId: data.tenderId || null,
        client: data.client,
        title: data.title,
        state: data.state || null,
        district: data.district || null,
        tenderValue: data.tenderValue ?? null,
        emd: data.emd ?? null,
        tenderFee: data.tenderFee ?? null,
        publishDate: new Date(data.publishDate),
        preBidDate: new Date(data.preBidDate),
        lastDate: new Date(data.lastDate),
        openingDate: new Date(data.openingDate),
        stage: data.stage || null,
        priority: data.priority || null,
        eligibility: data.eligibility || null,
        technicalStatus: data.technicalStatus || null,
        commercialStatus: data.commercialStatus || null,
        emdStatus: data.emdStatus || null,
        isBidSubmitted: !!data.isBidSubmitted,
        submissionDate: new Date(data.submissionDate),
        expectedResultDate: new Date(data.expectedResultDate),
        awardStatus: data.awardStatus || null,
        competitor: data.competitor || null,
        ourQuotation: data.ourQuotation ?? null,
        expectedMargin: data.expectedMargin ?? null,
        expectedMarginRupees: data.expectedMarginRupees ?? null,
        responsiblePerson: data.responsiblePerson || null,
        partner: data.partner || null,
        nextAction: data.nextAction || null,
        nextActionDate: data.nextActionDate ? new Date(data.nextActionDate) : null,
        remarks: data.remarks || null,
        documentUrl: data.documentUrl || null,
        updatedAt: sql`NOW() AT TIME ZONE 'Asia/Kolkata'`,
      })
      .where(eq(tenderTable.id, id))
      .returning();

    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("SERVER ERROR [updateTenderAction]:", error);
    return { success: false, error: "Failed to update tender details. Please try again." };
  }
}

