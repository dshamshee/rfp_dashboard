"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { incomingBidTable } from "@/lib/db/schema";
import { usersTable } from "@/lib/db/schema/user";
import { eq, desc, sql } from "drizzle-orm";
import { GetServerSessionHere } from "@/app/api/auth/[...nextauth]/options";
import { incomingBidFormSchema, IncomingBidFormData } from "./zod-type/incoming-bid-type";

export async function getIncomingBidsAction() {
  try {
    const bids = await db
      .select({
        id: incomingBidTable.id,
        userId: incomingBidTable.userId,
        Department: incomingBidTable.Department,
        bidDetails: incomingBidTable.bidDetails,
        oemDetails: incomingBidTable.oemDetails,
        remarks: incomingBidTable.remarks,
        publicationDate: incomingBidTable.publicationDate,
        createdAt: incomingBidTable.createdAt,
        updatedAt: incomingBidTable.updatedAt,
        userName: usersTable.name,
        userEmail: usersTable.email,
      })
      .from(incomingBidTable)
      .leftJoin(usersTable, eq(incomingBidTable.userId, usersTable.id))
      .orderBy(desc(incomingBidTable.publicationDate), desc(incomingBidTable.createdAt));

    return { success: true, data: bids };
  } catch (error: any) {
    console.error("SERVER ERROR [getIncomingBidsAction]:", error);
    return { success: false, error: "Failed to load incoming bids. Please refresh the page.", data: [] };
  }
}

export async function createIncomingBidAction(data: IncomingBidFormData) {
  try {
    const session = await GetServerSessionHere();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to add an incoming bid." };
    }

    const validatedData = incomingBidFormSchema.parse(data);

    const [inserted] = await db.insert(incomingBidTable).values({
      userId: session.user.id,
      Department: validatedData.Department,
      bidDetails: validatedData.bidDetails,
      oemDetails: validatedData.oemDetails || null,
      remarks: validatedData.remarks || null,
      publicationDate: validatedData.publicationDate,
      createdAt: sql`NOW()`,
      updatedAt: sql`NOW()`,
    }).returning();

    revalidatePath("/");
    revalidatePath("/incoming-bid");

    return { success: true, data: inserted };
  } catch (error: any) {
    console.error("SERVER ERROR [createIncomingBidAction]:", error);
    return {
      success: false,
      error: "Failed to create incoming bid. Please check your inputs and try again.",
    };
  }
}

export async function updateIncomingBidAction(id: string, data: IncomingBidFormData) {
  try {
    const validatedData = incomingBidFormSchema.parse(data);

    const [updated] = await db
      .update(incomingBidTable)
      .set({
        Department: validatedData.Department,
        bidDetails: validatedData.bidDetails,
        oemDetails: validatedData.oemDetails || null,
        remarks: validatedData.remarks || null,
        publicationDate: validatedData.publicationDate,
        updatedAt: sql`NOW()`,
      })
      .where(eq(incomingBidTable.id, id))
      .returning();

    revalidatePath("/");
    revalidatePath("/incoming-bid");

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("SERVER ERROR [updateIncomingBidAction]:", error);
    return { success: false, error: "Failed to update incoming bid. Please try again." };
  }
}

export async function deleteIncomingBidAction(id: string) {
  try {
    await db.delete(incomingBidTable).where(eq(incomingBidTable.id, id));
    revalidatePath("/");
    revalidatePath("/incoming-bid");
    return { success: true };
  } catch (error: any) {
    console.error("SERVER ERROR [deleteIncomingBidAction]:", error);
    return { success: false, error: "Failed to delete incoming bid. Please try again." };
  }
}
