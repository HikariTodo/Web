import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { eq, desc, asc } from "drizzle-orm";
import database from "../database";

export type Task = InferSelectModel<typeof database.schema.tasks>;
export type NewTask = InferInsertModel<typeof database.schema.tasks>;
export type TaskWithProject = Task & { projectTitle: string | null };

export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
  console.log(`[api]: fetching tasks for project ${projectId}...`);

  const tasks = await database.client
    .select()
    .from(database.schema.tasks)
    .where(eq(database.schema.tasks.projectId, projectId))
    .orderBy(
      asc(database.schema.tasks.deadline),
      desc(database.schema.tasks.priority),
      desc(database.schema.tasks.createdAt)
    );

  return tasks;
};

export const getAllTasks = async (): Promise<TaskWithProject[]> => {
  console.log("[api]: fetching all tasks...");

  const tasks = await database.client
    .select({
      id: database.schema.tasks.id,
      title: database.schema.tasks.title,
      projectId: database.schema.tasks.projectId,
      priority: database.schema.tasks.priority,
      status: database.schema.tasks.status,
      deadline: database.schema.tasks.deadline,
      createdAt: database.schema.tasks.createdAt,
      updatedAt: database.schema.tasks.updatedAt,
      projectTitle: database.schema.projects.title,
    })
    .from(database.schema.tasks)
    .leftJoin(
      database.schema.projects,
      eq(database.schema.tasks.projectId, database.schema.projects.id)
    )
    .orderBy(
      asc(database.schema.tasks.deadline),
      desc(database.schema.tasks.priority),
      desc(database.schema.tasks.createdAt)
    );

  return tasks;
};

export const createTask = async (task: NewTask): Promise<Task> => {
  console.log("[api]: creating task...");

  const [newTask] = await database.client
    .insert(database.schema.tasks)
    .values(task)
    .returning();

  return newTask;
};

export const createSubproject = async (title: string, parentId: string) => {
  console.log("[api]: creating subproject...");

  const [newProject] = await database.client
    .insert(database.schema.projects)
    .values({
      title,
      parent: parentId,
    })
    .returning();

  return newProject;
};
