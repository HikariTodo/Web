import { pgTable as table, type AnyPgColumn } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const projects = table("projects", {
  id: t.uuid().primaryKey().defaultRandom(),
  title: t.varchar({ length: 100 }).notNull(),
  parent: t.uuid().references((): AnyPgColumn => projects.id),
});
