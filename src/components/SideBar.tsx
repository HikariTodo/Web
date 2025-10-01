import { For, type Component } from "solid-js";
import TablerPlus from "~icons/tabler/plus";
import TablerAlbum from "~icons/tabler/album";

// Mock data for projects - replace with actual data later
const mockProjects = [
  {
    id: 1,
    name: "Personal",
    taskCount: 5,
    subprojects: [
      {
        id: 5,
        name: "Health & Fitness",
        taskCount: 3,
        subprojects: [{ id: 8, name: "Gym Routine", taskCount: 2 }],
      },
      { id: 6, name: "Personal Development", taskCount: 1 },
    ],
  },
  {
    id: 2,
    name: "Work",
    taskCount: 12,
    subprojects: [
      {
        id: 7,
        name: "Client Projects",
        taskCount: 8,
        subprojects: [
          { id: 9, name: "Website Redesign", taskCount: 5 },
          { id: 10, name: "Mobile App", taskCount: 3 },
        ],
      },
    ],
  },
  { id: 3, name: "Home Renovation", taskCount: 8 },
  { id: 4, name: "Learning", taskCount: 3 },
];

interface Project {
  id: number;
  name: string;
  taskCount: number;
  subprojects?: Project[];
}

const ProjectItem: Component<{ project: Project; depth?: number }> = (
  props
) => {
  const depth = () => props.depth || 0;

  return (
    <>
      <button class="w-full flex items-center px-3 py-2 text-left rounded-lg hover:bg-gray-100 transition-colors group relative">
        {/* Hierarchy bars */}
        {depth() > 0 && (
          <>
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
            {/* Connection line */}
            <div
              class="absolute top-1/2 w-3 h-0.5 bg-gray-200"
              style={{
                left: `${12 + (depth() - 1) * 16}px`,
              }}
            />
          </>
        )}

        <div
          class="flex-1 min-w-0 flex items-center justify-between"
          style={{ "margin-left": `${depth() * 16}px` }}
        >
          <span class="text-sm font-medium text-gray-700 group-hover:text-black truncate">
            {props.project.name}
          </span>
          <span class="text-xs text-gray-500 ml-2 flex-shrink-0">
            {props.project.taskCount}
          </span>
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

export default function SideBar() {
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
          <button class="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-gray-100 transition-colors group">
            <TablerAlbum />
            <span class="text-sm font-medium text-gray-700 group-hover:text-black">
              Today
            </span>
          </button>
          <button class="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-gray-100 transition-colors group">
            <TablerAlbum />
            <span class="text-sm font-medium text-gray-700 group-hover:text-black">
              Overview
            </span>
          </button>
        </div>

        {/* Projects Section */}
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Projects
            </h3>
            <button class="w-4 h-4 text-gray-500 hover:text-black transition-colors">
              <TablerPlus />
            </button>
          </div>

          <div class="">
            <For each={mockProjects}>
              {(project) => <ProjectItem project={project} />}
            </For>
          </div>
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
}
