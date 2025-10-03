import { For, createResource, Suspense, Show, createMemo } from "solid-js";
import { A } from "@solidjs/router";
import {
  getAllTasks,
  assignTaskToDate,
  unassignTask,
  type TaskWithProject,
} from "../api/tasks";
import TablerAlertCircle from "~icons/tabler/alert-circle";
import TablerCheck from "~icons/tabler/check";
import TablerPlus from "~icons/tabler/plus";

function getStatusColor(status: string) {
  switch (status) {
    case "done":
      return "text-emerald-600";
    case "in_progress":
      return "text-blue-600";
    default:
      return "text-slate-500";
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
  const [_tasks, { mutate }] = createResource(getAllTasks);

  const tasks = createMemo(() => {
    if (!_tasks()) return;

    let t = _tasks()!;
    t.sort((a, b) => {
      // First sort by deadline (earliest first, null deadlines last)
      if (a.deadline && b.deadline) {
        const deadlineComparison =
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        if (deadlineComparison !== 0) return deadlineComparison;
      } else if (a.deadline && !b.deadline) {
        return -1; // a has deadline, b doesn't - a comes first
      } else if (!a.deadline && b.deadline) {
        return 1; // b has deadline, a doesn't - b comes first
      }

      // Then sort by priority (urgent first)
      if (a.priority === "urgent" && b.priority !== "urgent") return -1;
      if (a.priority !== "urgent" && b.priority === "urgent") return 1;

      // Finally sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return t;
  });

  const handleAssignToToday = async (taskId: string) => {
    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    await assignTaskToDate(taskId, today);
    mutate((prev) => {
      let value = prev ?? [];
      const old = value.find((t) => t.id === taskId)!;
      value = value.filter((t) => t.id !== taskId);
      value.push({ ...old, assignedFor: today });
      return value;
    });
  };

  const handleUnassignTask = async (taskId: string) => {
    await unassignTask(taskId);
    mutate((prev) => {
      let value = prev ?? [];
      const old = value.find((t) => t.id === taskId)!;
      value = value.filter((t) => t.id !== taskId);
      value.push({ ...old, assignedFor: null });
      return value;
    });
  };

  const isAssignedToToday = (assignedFor: string | null) => {
    if (!assignedFor) return false;
    const today = new Date().toISOString().split("T")[0];
    return assignedFor === today;
  };

  return (
    <main class="flex-1 overflow-auto bg-white">
      <div class="p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold tracking-tight text-black mb-2">
            Overview
          </h1>
          <p class="text-slate-600 text-sm">
            All tasks sorted by deadline and priority
          </p>
        </div>

        <Suspense
          fallback={
            <div class="space-y-3">
              <For each={Array.from({ length: 5 })}>
                {() => (
                  <div class="bg-slate-100 rounded-lg p-4 animate-pulse h-20" />
                )}
              </For>
            </div>
          }
        >
          <Show when={tasks()?.length === 0}>
            <div class="text-center py-16">
              <div class="text-slate-400 mb-4">
                <TablerCheck class="w-16 h-16 mx-auto" />
              </div>
              <h3 class="text-lg font-semibold text-slate-900 mb-2">
                No tasks found
              </h3>
              <p class="text-slate-600 text-sm">
                Create your first task to get started!
              </p>
            </div>
          </Show>

          <Show when={tasks()?.length}>
            <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <table class="w-full table-fixed">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="w-2/5 px-6 py-4 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Task
                    </th>
                    <th class="w-1/6 px-6 py-4 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="w-1/6 px-6 py-4 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Due
                    </th>
                    <th class="w-1/4 px-6 py-4 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Assigned For
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-slate-200">
                  <For each={tasks()}>
                    {(task: TaskWithProject) => (
                      <tr
                        class={`transition-colors ${
                          isAssignedToToday(task.assignedFor)
                            ? "bg-gray-50"
                            : ""
                        }`}
                      >
                        <td class="px-6 py-4 w-2/5">
                          <div class="flex items-center gap-3">
                            <div class="flex-1 min-w-0">
                              <div class="flex items-center gap-3 mb-1">
                                <h3 class="text-sm font-medium text-slate-900 truncate">
                                  {task.title}
                                </h3>
                                <Show when={task.priority === "urgent"}>
                                  <span class="inline-flex items-center gap-1.5 text-xs px-2 py-1 bg-red-50 text-red-700 font-medium rounded-md border border-red-200 whitespace-nowrap">
                                    <TablerAlertCircle class="w-3 h-3 flex-shrink-0" />
                                    URGENT
                                  </span>
                                </Show>
                              </div>
                              <Show when={task.projectBreadcrumbs?.length > 0}>
                                <div class="text-xs text-slate-500 truncate">
                                  {task.projectBreadcrumbs.map(
                                    (project, index) => (
                                      <>
                                        <A
                                          href={`/projects/${project.id}`}
                                          class="hover:text-slate-700 transition-colors cursor-pointer"
                                        >
                                          {project.title}
                                        </A>
                                        {index <
                                          task.projectBreadcrumbs.length -
                                            1 && <span class="mx-1">→</span>}
                                      </>
                                    )
                                  )}
                                </div>
                              </Show>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 w-1/6">
                          <div class="h-6 flex items-center">
                            <Show when={task.assignedFor}>
                              <span
                                class={`inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap ${getStatusColor(
                                  task.status
                                )}`}
                              >
                                <span class="w-2 h-2 rounded-full bg-current flex-shrink-0" />
                                {task.status === "done"
                                  ? "DONE"
                                  : task.status === "in_progress"
                                  ? "IN PROGRESS"
                                  : "TODO"}
                              </span>
                            </Show>
                          </div>
                        </td>
                        <td class="px-6 py-4 w-1/6">
                          <div class="min-h-[2.5rem] flex flex-col justify-center">
                            <div
                              class={`text-sm ${
                                isOverdue(task.deadline)
                                  ? "text-red-600 font-medium"
                                  : "text-slate-900"
                              }`}
                            >
                              <div class="flex items-center gap-2 mb-1">
                                <span class="font-medium whitespace-nowrap">
                                  {formatDate(task.deadline)}
                                </span>
                              </div>
                              <Show when={task.deadline}>
                                <div class="text-xs text-slate-500">
                                  {formatTime(task.deadline)}
                                </div>
                              </Show>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 w-1/4">
                          <div class="min-h-[2.5rem] flex items-center">
                            <Show when={task.status === "done"}>
                              <Show
                                when={task.assignedFor}
                                fallback={
                                  <span class="text-xs text-gray-400">
                                    Not assigned
                                  </span>
                                }
                              >
                                <span class="text-xs text-gray-600">
                                  {new Date(
                                    task.assignedFor!
                                  ).toLocaleDateString()}
                                </span>
                              </Show>
                            </Show>

                            <Show when={task.status !== "done"}>
                              <div class="flex items-center gap-2 w-full">
                                <Show
                                  when={isAssignedToToday(task.assignedFor)}
                                  fallback={
                                    <Show
                                      when={task.assignedFor}
                                      fallback={
                                        <button
                                          onClick={() =>
                                            handleAssignToToday(task.id)
                                          }
                                          class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
                                          title="Assign to Today"
                                        >
                                          <TablerPlus class="w-3 h-3 flex-shrink-0" />
                                          Today
                                        </button>
                                      }
                                    >
                                      <div class="flex items-center gap-2 w-full">
                                        <span class="text-xs text-slate-600 font-medium whitespace-nowrap">
                                          {new Date(
                                            task.assignedFor!
                                          ).toLocaleDateString()}
                                        </span>
                                        <button
                                          onClick={() =>
                                            handleUnassignTask(task.id)
                                          }
                                          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-md border border-red-200 transition-colors whitespace-nowrap flex-shrink-0"
                                          title="Give up this task"
                                        >
                                          Give up
                                        </button>
                                      </div>
                                    </Show>
                                  }
                                >
                                  <div class="flex items-center gap-4 w-full">
                                    <span class="inline-flex items-center text-xs bg-gray-50 text-gray-700 py-1.5 rounded-md font-medium whitespace-nowrap">
                                      Today
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleUnassignTask(task.id)
                                      }
                                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-md border border-red-200 transition-colors whitespace-nowrap flex-shrink-0"
                                      title="Give up today's task"
                                    >
                                      Give up
                                    </button>
                                  </div>
                                </Show>
                              </div>
                            </Show>
                          </div>
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
