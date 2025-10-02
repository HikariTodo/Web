import type { InferSelectModel } from "drizzle-orm";
import database from "../database";

export type LocalDbProject = InferSelectModel<typeof database.schema.projects>;
export interface Project {
  id: string;
  title: string;
  subprojects: Array<Project>;
}

const buildProjectTree = (all: Array<LocalDbProject>): Array<Project> => {
  const root: Array<LocalDbProject> = [];

  // parent id <-> children for O(1) lookups
  const map = new Map<string, Array<LocalDbProject>>();

  // Single pass to organize projects by parent
  for (const project of all) {
    if (!project.parent) {
      root.push(project);
    } else {
      if (!map.has(project.parent)) {
        map.set(project.parent, []);
      }
      map.get(project.parent)!.push(project);
    }
  }

  // Recursive function to build tree structure using the map
  const subtree = (id: string): Array<Project> => {
    const children = map.get(id) || [];

    return children.map((child) => ({
      id: child.id,
      title: child.title,
      subprojects: subtree(child.id),
    }));
  };

  return root.map((project) => ({
    id: project.id,
    title: project.title,
    subprojects: subtree(project.id),
  }));
};

export const getProjects = async (): Promise<Array<Project>> => {
  console.log("[api]: fetching projects...");

  const local = await database.client.select().from(database.schema.projects);
  return buildProjectTree(local);
};
