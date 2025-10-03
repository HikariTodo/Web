import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const taskPriority = t.pgEnum("task_priority", ["urgent", "normal"]);
export const taskStatus = t.pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
]);

export const tasks = table("tasks", {
  id: t.uuid().primaryKey().defaultRandom(),
  title: t.varchar({ length: 300 }).notNull(),
  projectId: t
    .uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  priority: taskPriority().default("normal").notNull(),
  status: taskStatus().default("todo").notNull(),
  deadline: t.timestamp(),
  assignedFor: t.date("assigned_for"),
  createdAt: t.timestamp("created_at").notNull().defaultNow(),
  updatedAt: t
    .timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
