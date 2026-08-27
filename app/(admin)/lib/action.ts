"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tenderTable, discussionTable } from "@/lib/db/schema";
import { usersTable } from "@/lib/db/schema/user";
import { eq, desc, sql, countDistinct } from "drizzle-orm";
import { GetServerSessionHere } from "@/app/api/auth/[...nextauth]/options";

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
        tenderId: data.tenderId,
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
    const isDuplicate =
      error?.code === "23505" ||
      error?.cause?.code === "23505" ||
      (error?.message && error.message.includes("duplicate key"));

    if (isDuplicate) {
      return {
        success: false,
        error: `A tender with Reference ID "${data.tenderId}" already exists. Please enter a unique Tender Reference ID.`,
      };
    }

    console.error("SERVER ERROR [updateTenderAction]:", error);
    return { success: false, error: "Failed to update tender details. Please try again." };
  }
}

export async function addDiscussionAction(tenderId: string, message: string) {
  try {
    const session = await GetServerSessionHere();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to add a discussion." };
    }

    await db.insert(discussionTable).values({
      tenderId,
      userId: session.user.id,
      message,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("SERVER ERROR [addDiscussionAction]:", error);
    return { success: false, error: "Failed to add discussion. Please try again." };
  }
}

export async function getDiscussionsAction(tenderId: string) {
  try {
    const discussions = await db
      .select({
        id: discussionTable.id,
        tenderId: discussionTable.tenderId,
        userId: discussionTable.userId,
        message: discussionTable.message,
        createdAt: discussionTable.createdAt,
        updatedAt: discussionTable.updatedAt,
        userName: usersTable.name,
        userEmail: usersTable.email,
      })
      .from(discussionTable)
      .leftJoin(usersTable, eq(discussionTable.userId, usersTable.id))
      .where(eq(discussionTable.tenderId, tenderId))
      .orderBy(desc(discussionTable.createdAt));

    return { success: true, data: discussions };
  } catch (error: any) {
    console.error("SERVER ERROR [getDiscussionsAction]:", error);
    return { success: false, error: "Failed to load discussions.", data: [] };
  }
}

export async function getDiscussionCountAction() {
  try {
    const result = await db
      .select({ count: countDistinct(discussionTable.tenderId) })
      .from(discussionTable);

    return { success: true, count: result[0]?.count ?? 0 };
  } catch (error: any) {
    console.error("SERVER ERROR [getDiscussionCountAction]:", error);
    return { success: false, error: "Failed to get discussion count.", count: 0 };
  }
}

export async function getTenderIdsWithDiscussionsAction() {
  try {
    const result = await db
      .selectDistinct({ tenderId: discussionTable.tenderId })
      .from(discussionTable);

    return { success: true, data: result.map((r) => r.tenderId) };
  } catch (error: any) {
    console.error("SERVER ERROR [getTenderIdsWithDiscussionsAction]:", error);
    return { success: false, error: "Failed to get tenders with discussions.", data: [] };
  }
}
