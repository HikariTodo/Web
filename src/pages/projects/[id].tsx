import { useNavigate, useParams } from "@solidjs/router";
import { createEffect, createResource, For, Show, Suspense } from "solid-js";
import { getTasksByProject, type Task } from "../../api/tasks";
import TablerPlus from "~icons/tabler/plus";
import TablerCalendar from "~icons/tabler/calendar";
import TablerAlertCircle from "~icons/tabler/alert-circle";
import TablerFolder from "~icons/tabler/folder";
import TablerCheck from "~icons/tabler/check";
import { getProjectById } from "../../api/projects";
import { useDialog } from "../../hooks/dialog";
import CreateTask from "../../components/dialogs/CreateTask";
import CreateSubproject from "../../components/dialogs/CreateSubproject";

export default function View() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Dialog hooks
  const createTaskDialog = useDialog(CreateTask);
  const createSubprojectDialog = useDialog(CreateSubproject);

  // Resources for data fetching
  const [project] = createResource(() => params.id, getProjectById);
  const [tasks, { refetch: refetchTasks }] = createResource(
    () => params.id,
    getTasksByProject
  );

  createEffect(() => {
    if (!project.loading && !project()) navigate("/");
  });

  const handleCreateTask = async () => {
    const result = await createTaskDialog.showAndWait({ projectId: params.id });
    if (!result) return;
    refetchTasks();
  };

  const handleCreateSubproject = async () => {
    const result = await createSubprojectDialog.showAndWait({
      projectId: params.id,
    });
    if (result) {
      // Could refetch projects here if needed
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "No deadline";
    return new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue = (deadline: Date | null) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const getPriorityColor = (priority: string) => {
    return priority === "urgent" ? "text-red-500" : "text-gray-500";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "text-green-500";
      case "in_progress":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div class="mb-8">
          <Suspense
            fallback={
              <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            }
          >
            <Show when={project()}>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {project()?.title}
              </h1>
            </Show>
          </Suspense>

          {/* Action buttons */}
          <div class="flex gap-3 mt-4">
            <button
              onClick={handleCreateTask}
              class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <TablerPlus class="w-4 h-4" />
              Add Task
            </button>
            <button
              onClick={handleCreateSubproject}
              class="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              <TablerFolder class="w-4 h-4" />
              Add Subproject
            </button>
          </div>
        </div>

        {/* Tasks Table */}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Tasks
            </h2>
          </div>

          <Suspense
            fallback={
              <div class="p-6">
                <div class="space-y-4">
                  <For each={Array.from({ length: 3 })}>
                    {() => (
                      <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    )}
                  </For>
                </div>
              </div>
            }
          >
            <Show when={tasks()?.length === 0}>
              <div class="p-8 text-center text-gray-500 dark:text-gray-400">
                <TablerCheck class="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tasks yet. Create your first task to get started!</p>
              </div>
            </Show>

            <Show when={tasks()?.length}>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Task
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Priority
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Deadline
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <For each={tasks()}>
                      {(task: Task) => (
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td class="px-6 py-4">
                            <div class="text-sm font-medium text-gray-900 dark:text-white">
                              {task.title}
                            </div>
                          </td>
                          <td class="px-6 py-4">
                            <span
                              class={`inline-flex items-center gap-1 text-sm font-medium ${getStatusColor(
                                task.status
                              )}`}
                            >
                              <span class="w-2 h-2 rounded-full bg-current" />
                              {task.status.replace("_", " ").toUpperCase()}
                            </span>
                          </td>
                          <td class="px-6 py-4">
                            <span
                              class={`inline-flex items-center gap-1 text-sm font-medium ${getPriorityColor(
                                task.priority
                              )}`}
                            >
                              <Show when={task.priority === "urgent"}>
                                <TablerAlertCircle class="w-4 h-4" />
                              </Show>
                              {task.priority.toUpperCase()}
                            </span>
                          </td>
                          <td class="px-6 py-4">
                            <span
                              class={`inline-flex items-center gap-1 text-sm ${
                                isOverdue(task.deadline)
                                  ? "text-red-500 font-medium"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              <TablerCalendar class="w-4 h-4" />
                              {formatDate(task.deadline)}
                            </span>
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
      </div>
    </div>
  );
}
