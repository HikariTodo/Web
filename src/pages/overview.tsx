import { For, createResource, Suspense, Show } from "solid-js";
import { getAllTasks, type TaskWithProject } from "../api/tasks";
import TablerCalendar from "~icons/tabler/calendar";
import TablerAlertCircle from "~icons/tabler/alert-circle";
import TablerCheck from "~icons/tabler/check";

function getStatusColor(status: string) {
  switch (status) {
    case "done":
      return "text-green-500";
    case "in_progress":
      return "text-blue-500";
    default:
      return "text-gray-500";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "todo":
      return "UNASSIGNED";
    case "in_progress":
      return "IN PROGRESS";
    case "done":
      return "DONE";
    default:
      return status.toUpperCase();
  }
}

function formatDate(date: Date | null) {
  if (!date) return "No deadline";

  const taskDate = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (taskDate.toDateString() === today.toDateString()) {
    return "Today";
  } else if (taskDate.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  } else {
    return taskDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year:
        taskDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  }
}

function formatTime(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
}

function isOverdue(deadline: Date | null) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export default function Overview() {
  const [tasks] = createResource(getAllTasks);

  return (
    <main class="flex-1 overflow-auto">
      <div class="p-8">
        <div class="mb-6">
          <h1 class="text-2xl font-semibold text-black mb-2">Overview</h1>
          <p class="text-gray-600">All tasks sorted by deadline and priority</p>
        </div>

        <Suspense
          fallback={
            <div class="space-y-3">
              <For each={Array.from({ length: 5 })}>
                {() => (
                  <div class="bg-gray-200 rounded-lg p-4 animate-pulse h-20" />
                )}
              </For>
            </div>
          }
        >
          <Show when={tasks()?.length === 0}>
            <div class="text-center py-12">
              <div class="text-gray-400 mb-2">
                <TablerCheck class="w-12 h-12 mx-auto" />
              </div>
              <p class="text-gray-600">
                No tasks found. Create your first task to get started!
              </p>
            </div>
          </Show>

          <Show when={tasks()?.length}>
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <For each={tasks()}>
                    {(task: TaskWithProject) => (
                      <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                            <div class="flex-1 min-w-0">
                              <div class="flex items-center gap-2">
                                <h3 class="text-sm font-medium text-black">
                                  {task.title}
                                </h3>
                                <Show when={task.priority === "urgent"}>
                                  <span class="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-red-100 text-red-600 font-medium rounded">
                                    <TablerAlertCircle class="w-3 h-3" />
                                    URGENT
                                  </span>
                                </Show>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <span class="text-sm text-gray-900">
                            {task.projectTitle || "Unknown Project"}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <span
                            class={`inline-flex items-center gap-1 text-xs font-medium ${getStatusColor(
                              task.status
                            )}`}
                          >
                            <span class="w-2 h-2 rounded-full bg-current" />
                            {getStatusLabel(task.status)}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <div
                            class={`text-sm ${
                              isOverdue(task.deadline)
                                ? "text-red-500 font-medium"
                                : "text-gray-900"
                            }`}
                          >
                            <div class="flex items-center gap-1 mb-1">
                              <TablerCalendar class="w-3 h-3" />
                              {formatDate(task.deadline)}
                            </div>
                            <Show when={task.deadline}>
                              <div class="text-xs text-gray-600">
                                {formatTime(task.deadline)}
                              </div>
                            </Show>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <button class="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg
                              class="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
        </Suspense>
      </div>
    </main>
  );
}
