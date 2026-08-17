import { defineRelations } from "drizzle-orm";
import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const userPost = pgTable("post", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull(),
  authorId: integer().notNull().references(() => usersTable.id),
});

export const userRelations = defineRelations({ usersTable, userPost }, (r) => ({
  usersTable: {
    posts: r.many.userPost({
      from: r.usersTable.id,
      to: r.userPost.authorId,
    }),
  },
  userPost: {
    author: r.one.usersTable({
      from: r.userPost.authorId,
      to: r.usersTable.id,
    }),
  },
}));