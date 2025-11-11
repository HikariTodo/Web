import { createResource } from "solid-js";
import { getProjects } from "../api/projects";
import database from "../database";

export const [projects, { refetch: refetchProjects }] = createResource(
  () => !database.loading && !database.error,
  getProjects
);
