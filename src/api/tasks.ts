import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { eq, desc, asc } from "drizzle-orm";
import database from "../database";

export type Task = InferSelectModel<typeof database.schema.tasks>;
export type NewTask = InferInsertModel<typeof database.schema.tasks>;
export type TaskWithProject = Task & {
  projectTitle: string | null;
  projectBreadcrumbs: Array<{ id: string; title: string }>;
};

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

  // First get all tasks with their immediate project
  const tasks = await database.client
    .select({
      id: database.schema.tasks.id,
      title: database.schema.tasks.title,
      projectId: database.schema.tasks.projectId,
      priority: database.schema.tasks.priority,
      status: database.schema.tasks.status,
      deadline: database.schema.tasks.deadline,
      assignedFor: database.schema.tasks.assignedFor,
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

  // Get all projects to build breadcrumbs
  const allProjects = await database.client
    .select()
    .from(database.schema.projects);

  // Build project map for breadcrumb generation
  const projectMap = new Map(allProjects.map((p) => [p.id, p]));

  // Add breadcrumbs to each task
  const tasksWithBreadcrumbs = tasks.map((task) => {
    const breadcrumbs: Array<{ id: string; title: string }> = [];
    let currentProjectId: string | null = task.projectId;

    while (currentProjectId && projectMap.has(currentProjectId)) {
      const project = projectMap.get(currentProjectId);
      if (project) {
        breadcrumbs.unshift({ id: project.id, title: project.title });
        currentProjectId = project.parent;
      } else {
        break;
      }
    }

    return {
      ...task,
      projectBreadcrumbs: breadcrumbs,
    };
  });

  return tasksWithBreadcrumbs;
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

export const assignTaskToDate = async (
  taskId: string,
  date: string
): Promise<Task> => {
  console.log(`[api]: assigning task ${taskId} to date ${date}...`);

  const [updatedTask] = await database.client
    .update(database.schema.tasks)
    .set({
      assignedFor: date,
      updatedAt: new Date(),
    })
    .where(eq(database.schema.tasks.id, taskId))
    .returning();

  return updatedTask;
};

export const unassignTask = async (taskId: string): Promise<Task> => {
  console.log(`[api]: unassigning task ${taskId}...`);

  const [updatedTask] = await database.client
    .update(database.schema.tasks)
    .set({
      assignedFor: null,
      updatedAt: new Date(),
    })
    .where(eq(database.schema.tasks.id, taskId))
    .returning();

  return updatedTask;
};

export const updateTaskStatus = async (
  taskId: string,
  status: "todo" | "in_progress" | "done"
): Promise<Task> => {
  console.log(`[api]: updating task ${taskId} status to ${status}...`);

  const [updatedTask] = await database.client
    .update(database.schema.tasks)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(database.schema.tasks.id, taskId))
    .returning();

  return updatedTask;
};

export const getTodayTasks = async (): Promise<TaskWithProject[]> => {
  console.log("[api]: fetching today's tasks...");

  const today = new Date().toISOString().split("T")[0];

  // Get tasks that are either assigned for today or due today
  const tasks = await database.client
    .select({
      id: database.schema.tasks.id,
      title: database.schema.tasks.title,
      projectId: database.schema.tasks.projectId,
      priority: database.schema.tasks.priority,
      status: database.schema.tasks.status,
      deadline: database.schema.tasks.deadline,
      assignedFor: database.schema.tasks.assignedFor,
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

  // Get all projects to build breadcrumbs
  const allProjects = await database.client
    .select()
    .from(database.schema.projects);

  // Build project map for breadcrumb generation
  const projectMap = new Map(allProjects.map((p) => [p.id, p]));

  // Add breadcrumbs to each task
  const tasksWithBreadcrumbs = tasks.map((task) => {
    const breadcrumbs: Array<{ id: string; title: string }> = [];
    let currentProjectId: string | null = task.projectId;

    while (currentProjectId && projectMap.has(currentProjectId)) {
      const project = projectMap.get(currentProjectId);
      if (project) {
        breadcrumbs.unshift({ id: project.id, title: project.title });
        currentProjectId = project.parent;
      } else {
        break;
      }
    }

    return {
      ...task,
      projectBreadcrumbs: breadcrumbs,
    };
  });

  // Filter for today's tasks (assigned for today or due today)
  return tasksWithBreadcrumbs.filter((task) => {
    const taskDeadline = task.deadline
      ? new Date(task.deadline).toISOString().split("T")[0]
      : null;
    const isAssignedForToday = task.assignedFor === today;
    const isDueToday = taskDeadline === today;

    return isAssignedForToday || isDueToday;
  });
};
