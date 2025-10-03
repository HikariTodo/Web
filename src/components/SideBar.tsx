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
import TextLogo from "./assets/TextLogo";

const ProjectItem: Component<{
  project: Project;
  depth?: number;
}> = (props) => {
  const depth = () => props.depth || 0;

  return (
    <>
      <A
        href={`/projects/${props.project.id}`}
        class="w-full flex items-center px-3 py-2 text-left rounded-lg hover:bg-gray-100 transition-colors group relative"
      >
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
      </A>
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
    navigate(`/projects/${returning.id}`);
  };

  return (
    <aside class="h-screen w-72 bg-white border-r border-#E7E7E7 flex flex-col">
      <TextLogo class="text-#373737 w-70px mt-6 mx-6 mb-6" />

      <nav class="flex flex-col grow-1 gap-6">
        <div class="px-4 text-#7C7C7C">
          <A
            href="/"
            class="w-full flex items-center gap-3 py-2 px-2 rounded hover:(bg-#F7F7F7 text-#585858) transition-colors"
          >
            <TablerAlbum />
            <span class="text-sm">Today</span>
          </A>
          <A
            href="/overview"
            class="w-full flex items-center gap-3 py-2 px-2 rounded hover:(bg-#F7F7F7 text-#585858) transition-colors"
          >
            <TablerAlbum />
            <span class="text-sm">All tasks</span>
          </A>
        </div>

        <div class="px-4 text-#7C7C7C">
          <div class="flex items-center justify-between mb-2">
            <h3 class="pl-2 font-semibold text-#585858">Projects</h3>

            <button type="button" class="text-gray-500" onClick={createProject}>
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

      {/* <div class="p-4 border-t border-gray-300">
        <button class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors">
          <TablerPlus />
          <span class="text-sm font-medium">Quick Add Task</span>
        </button>
      </div> */}
    </aside>
  );
};

export default SideBar;
