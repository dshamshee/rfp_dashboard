"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tenderTable } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getTendersAction() {
  try {
    const tenders = await db
      .select()
      .from(tenderTable)
      .orderBy(desc(tenderTable.createdAt), desc(tenderTable.id));
    return { success: true, data: tenders };
  } catch (error: any) {
    console.error("Failed to fetch tenders:", error);
    return { success: false, error: error?.message || "Failed to fetch tenders", data: [] };
  }
}

export async function toggleBidSubmittedAction(id: string, isBidSubmitted: boolean) {
  try {
    await db
      .update(tenderTable)
      .set({ isBidSubmitted, updatedAt: new Date() })
      .where(eq(tenderTable.id, id));

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to toggle bid status:", error);
    return { success: false, error: error?.message || "Failed to update bid status" };
  }
}

export async function deleteTenderAction(id: string) {
  try {
    await db.delete(tenderTable).where(eq(tenderTable.id, id));
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete tender:", error);
    return { success: false, error: error?.message || "Failed to delete tender" };
  }
}
