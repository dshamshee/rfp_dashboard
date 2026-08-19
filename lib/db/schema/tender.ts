import { boolean, check, date, integer, pgTable, real, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";

export const tenderTable = pgTable("tender", {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  tenderId: text("tender_id"),
  client: text("client").notNull(),
  title: text("title").notNull(),
  location: text("location"),
  tenderValue: integer("tender_value"),
  emd: integer("emd"),
  tenderFee: integer("tender_fee"),
  publishDate: timestamp("publish_date").notNull(),
  preBidDate: timestamp("pre_bid_date").notNull(),
  lastDate: timestamp("last_date").notNull(),
  openingDate: timestamp("opening_date").notNull(),
  stage: text("stage"),
  priority: text("priority"),
  eligibility: text("eligibility"),
  technicalStatus: text("technical_status"),
  commercialStatus: text("commercial_status"),
  emdStatus: text("emd_status"),
  isBidSubmitted: boolean("is_bid_submitted").notNull().default(false),
  submissionDate: timestamp("submission_date").notNull(),
  expectedResultDate: timestamp("expected_result_date").notNull(),
  awardStatus: text("award_status"),
  competitor: text("competitor"),
  ourQuotation: integer("our_quotation"),
  expectedMargin: real("expected_margin"),
  expectedMarginRupees: integer("expected_margin_rupees"),
  responsiblePerson: text("responsible_person"),
  partner: text("partner"),
  nextAction: text("next_action"),
  nextActionDate: timestamp("next_action_date"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  check(
    "priority_type_check",
    sql`priority in ('HIGH','MEDIUM','LOW')`,
  ),
  check(
    "eligibility_type_check",
    sql`eligibility in ('ELIGIBLE','NOT ELIGIBLE')`,
  ),
]);

export type Tender = typeof tenderTable.$inferSelect;
export type NewTender = typeof tenderTable.$inferInsert;