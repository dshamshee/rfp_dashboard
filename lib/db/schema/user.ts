
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { check, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  name: text().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: text().notNull(),
  role: text().notNull()

}, 

(table) => [
  check(
    "role_type_check",
    sql`role in ('ADMIN','SUPERADMIN')`,
  ),
]
);

