import {
  createResource,
  For,
  Show,
  Suspense,
  type Component,
  type VoidComponent,
} from "solid-js";
import TablerPlus from "~icons/tabler/plus";
import TablerAlbum from "~icons/tabler/album";
import { A, useNavigate } from "@solidjs/router";
import { useDialog } from "../hooks/dialog";
import CreateProject from "./dialogs/CreateProject";
import { getProjects, type Project } from "../api/projects";

const ProjectItem: Component<{
  project: Project;
  depth?: number;
}> = (props) => {
  const depth = () => props.depth || 0;

  return (
    <>
      <button class="w-full flex items-center px-3 py-2 text-left rounded-lg hover:bg-gray-100 transition-colors group relative">
        <Show when={depth() > 0}>
          <For each={Array.from({ length: depth() })}>
            {(_, i) => (
              <div
                class="absolute top-0 bottom-0 w-0.5 bg-gray-200"
                style={{
                  left: `${12 + i() * 16}px`,
                }}
              />
            )}
          </For>
          <div
            class="absolute top-1/2 w-3 h-0.5 bg-gray-200"
            style={{
              left: `${12 + (depth() - 1) * 16}px`,
            }}
          />
        </Show>

        <div
          class="flex-1 min-w-0 flex items-center justify-between"
          style={{ "margin-left": `${depth() * 16}px` }}
        >
          <span class="text-sm font-medium text-gray-700 group-hover:text-black truncate">
            {props.project.title}
          </span>
          {/* <span class="text-xs text-gray-500 ml-2 flex-shrink-0">
            {props.project.taskCount}
          </span> */}
        </div>
      </button>
      <For each={props.project.subprojects}>
        {(subproject) => (
          <ProjectItem project={subproject} depth={depth() + 1} />
        )}
      </For>
    </>
  );
};

const SideBar: VoidComponent = () => {
  const [projects, { refetch }] = createResource(getProjects);

  const { showAndWait: showCreateProject } = useDialog(CreateProject);
  const navigate = useNavigate();

  const createProject = async (): Promise<void> => {
    const returning = await showCreateProject();
    if (!returning) return;

    await refetch();
    navigate(`/tasks/${returning.id}`);
  };

  return (
    <aside class="h-screen w-64 bg-white border-r border-gray-300 flex flex-col">
      {/* Header */}
      <div class="px-6 py-4 border-b border-gray-300">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span class="text-white text-sm font-semibold">//</span>
          </div>
          <h1 class="text-lg font-semibold text-black">Hikari</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav class="flex-1 p-4 space-y-2">
        {/* Dashboard */}
        <div class="mb-6">
          <A
            href="/"
            class="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <TablerAlbum />
            <span class="text-sm font-medium text-gray-700 group-hover:text-black">
              Today
            </span>
          </A>
          <A
            href="/overview"
            class="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <TablerAlbum />
            <span class="text-sm font-medium text-gray-700 group-hover:text-black">
              Overview
            </span>
          </A>
        </div>

        {/* Projects Section */}
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Projects
            </h3>
            <button
              type="button"
              class="w-4 h-4 text-gray-500 hover:text-black transition-colors"
              onClick={createProject}
            >
              <TablerPlus />
            </button>
          </div>

          <Suspense fallback={<p>loading...</p>}>
            <div class="flex flex-col">
              <For each={projects()}>
                {(project) => <ProjectItem project={project} />}
              </For>
            </div>
          </Suspense>
        </div>
      </nav>

      {/* Quick Actions */}
      <div class="p-4 border-t border-gray-300">
        <button class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors">
          <TablerPlus />
          <span class="text-sm font-medium">Quick Add Task</span>
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
