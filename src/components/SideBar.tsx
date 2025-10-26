import {
  For,
  Show,
  Suspense,
  type Component,
  type VoidComponent,
  createSignal,
} from "solid-js";
import TablerPlus from "~icons/tabler/plus";
import TablerAlbum from "~icons/tabler/album";
import TablerChevronDown from "~icons/tabler/chevron-down";
import TablerChevronRight from "~icons/tabler/chevron-right";
import { A, useNavigate } from "@solidjs/router";
import { useDialog } from "../hooks/dialog";
import CreateProject from "./dialogs/CreateProject";
import { type Project } from "../api/projects";
import TextLogo from "./assets/TextLogo";
import { projects, refetchProjects } from "../stores/projects";

const ProjectItem: Component<{
  project: Project;
  depth?: number;
  expandedProjects: () => Set<string>;
  setExpandedProjects: (fn: (prev: Set<string>) => Set<string>) => void;
}> = (props) => {
  const depth = () => props.depth || 0;
  const hasSubprojects = () =>
    props.project.subprojects && props.project.subprojects.length > 0;
  const isExpanded = () => props.expandedProjects().has(props.project.id);

  const toggleExpanded = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    props.setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(props.project.id)) {
        newSet.delete(props.project.id);
      } else {
        newSet.add(props.project.id);
      }
      return newSet;
    });
  };

  return (
    <>
      <div class="relative">
        <Show when={depth() > 0}>
          <For each={Array.from({ length: depth() })}>
            {(_, i) => (
              <div
                class="absolute inset-y-0 w-1px bg-#7C7C7C/20"
                style={{
                  left: `${15.5 + i() * 16}px`,
                }}
              />
            )}
          </For>
        </Show>

        <div class="flex items-center">
          <div
            class="flex items-center w-full py-1.5 px-2 hover:(bg-#F7F7F7 text-#585858) group transition-colors"
            classList={{
              rounded: depth() === 0,
              "rounded-r": depth() > 0,
            }}
            style={{ "margin-left": `${depth() * 16}px` }}
          >
            <Show when={hasSubprojects()}>
              <button
                onClick={toggleExpanded}
                class="flex items-center justify-center w-4 h-4 mr-1 text-#7C7C7C hover:text-#585858 transition-colors"
              >
                <Show
                  when={isExpanded()}
                  fallback={<TablerChevronRight class="w-3 h-3" />}
                >
                  <TablerChevronDown class="w-3 h-3" />
                </Show>
              </button>
            </Show>
            <Show when={!hasSubprojects()}>
              <div class="w-5 mr-1" /> {/* Spacer for alignment */}
            </Show>

            <A
              href={`/projects/${props.project.id}`}
              class="flex-1 min-w-0 flex items-center justify-between"
            >
              <span class="text-sm truncate">{props.project.title}</span>
            </A>
          </div>
        </div>
      </div>

      <Show when={hasSubprojects() && isExpanded()}>
        <For each={props.project.subprojects}>
          {(subproject) => (
            <ProjectItem
              project={subproject}
              depth={depth() + 1}
              expandedProjects={props.expandedProjects}
              setExpandedProjects={props.setExpandedProjects}
            />
          )}
        </For>
      </Show>
    </>
  );
};

const SideBar: VoidComponent = () => {
  const [expandedProjects, setExpandedProjects] = createSignal<Set<string>>(
    new Set()
  );

  const { showAndWait: showCreateProject } = useDialog(CreateProject);
  const navigate = useNavigate();

  const createProject = async (): Promise<void> => {
    const returning = await showCreateProject();
    if (!returning) return;

    await refetchProjects();
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
                {(project) => (
                  <ProjectItem
                    project={project}
                    expandedProjects={expandedProjects}
                    setExpandedProjects={setExpandedProjects}
                  />
                )}
              </For>
            </div>
          </Suspense>
        </div>
      </nav>
    </aside>
  );
};

export default SideBar;
