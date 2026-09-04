import { boolean, check, date, integer, pgTable, real, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { usersTable } from "./user";

export const tenderTable = pgTable("tender", {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  tenderId: text("tender_id").unique().notNull(),
  client: text("client").notNull(),
  title: text("title").notNull(),
  state: text("state"),
  district: text("district"),
  tenderValue: integer("tender_value"),
  emd: integer("emd"),
  tenderFee: integer("tender_fee"),
  publishDate: timestamp("publish_date", { mode: "date" }).notNull(),
  preBidDate: timestamp("pre_bid_date", { mode: "date" }).notNull(),
  lastDate: timestamp("last_date", { mode: "date" }).notNull(),
  openingDate: timestamp("opening_date", { mode: "date" }).notNull(),
  stage: text("stage"),
  priority: text("priority"),
  eligibility: text("eligibility"),
  technicalStatus: text("technical_status"),
  commercialStatus: text("commercial_status"),
  emdStatus: text("emd_status"),
  isBidSubmitted: boolean("is_bid_submitted").notNull().default(false),
  submissionDate: timestamp("submission_date", { mode: "date" }).notNull(),
  expectedResultDate: timestamp("expected_result_date", { mode: "date" }).notNull(),
  awardStatus: text("award_status"),
  competitor: text("competitor"),
  ourQuotation: integer("our_quotation"),
  expectedMargin: real("expected_margin"),
  expectedMarginRupees: integer("expected_margin_rupees"),
  responsiblePerson: text("responsible_person"),
  partner: text("partner"),
  nextAction: text("next_action"),
  nextActionDate: timestamp("next_action_date", { mode: "date" }),
  remarks: text("remarks"),
  documentUrl: text("document_url"),
  insertedBy: text("inserted_by").notNull().default("MANUAL"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).default(sql`NOW()`).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).default(sql`NOW()`).notNull(),
}, (table) => [
  check(
    "priority_type_check",
    sql`priority in ('HIGH','MEDIUM','LOW')`,
  ),
  check(
    "eligibility_type_check",
    sql`eligibility in ('ELIGIBLE','NOT ELIGIBLE')`,
  ),
  check(
    "inserted_by_check",
    sql`inserted_by in ('MANUAL','AI')`,
  )
]);

export type Tender = typeof tenderTable.$inferSelect;
export type NewTender = typeof tenderTable.$inferInsert;


export const discussionTable = pgTable("discussion", {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  tenderId: varchar({ length: 128 }).notNull().references(() => tenderTable.id, { onDelete: "cascade" }),
  userId: varchar({ length: 128 }).notNull().references(() => usersTable.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).default(sql`NOW()`).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).default(sql`NOW()`).notNull(),
});

export type Discussion = typeof discussionTable.$inferSelect;
export type NewDiscussion = typeof discussionTable.$inferInsert;


export const incomingBidTable = pgTable("incoming_bid",{
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar({ length: 128 }).notNull().references(() => usersTable.id),
  Department: text().notNull(),
  bidDetails: text().notNull(),
  oemDetails: text(),
  remarks: text(),
  publicationDate: timestamp("publication_date", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).default(sql`NOW()`).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).default(sql`NOW()`).notNull(),
});

export type IncomingBid = typeof incomingBidTable.$inferSelect;
export type NewIncomingBid = typeof incomingBidTable.$inferInsert;