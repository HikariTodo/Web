import { createResource } from "solid-js";
import { getProjects } from "../api/projects";

export const [projects, { refetch: refetchProjects }] =
  createResource(getProjects);
