import { For, createResource, Suspense, Show } from "solid-js";
import { A } from "@solidjs/router";
import {
  getTodayTasks,
  updateTaskStatus,
  type TaskWithProject,
} from "../api/tasks";

function getPriorityOrder(priority: string) {
  switch (priority) {
    case "urgent":
      return 2;
    case "normal":
      return 1;
    default:
      return 0;
  }
}

function formatDate(date: Date | null) {
  if (!date) return "No deadline";

  const taskDate = new Date(date);
  const today = new Date();

  // Get tomorrow's date
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (taskDate.toDateString() === today.toDateString()) {
    return "Today";
  } else if (taskDate.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  } else {
    return taskDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }
}

function formatTime(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString(void 0, {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
}

function getRemainingTime(date: Date | null) {
  if (!date) return "No deadline";

  const deadline = new Date(date);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs < 0) {
    return "Overdue";
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours % 24}h`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  } else {
    return `${diffMinutes}m`;
  }
}

function getBreadcrumbs(
  projectBreadcrumbs: Array<{ id: string; title: string }>
) {
  if (projectBreadcrumbs.length === 0) return null;

  return (
    <div class="text-xs text-gray-500">
      {projectBreadcrumbs.map((project, index) => (
        <>
          <A
            href={`/projects/${project.id}`}
            class="text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            {project.title}
          </A>
          {index < projectBreadcrumbs.length - 1 && (
            <span class="mx-1 text-slate-400">→</span>
          )}
        </>
      ))}
    </div>
  );
}

// Custom checkbox component for three states
function TaskCheckbox(props: { status: string; onClick: () => void }) {
  return (
    <button
      onClick={props.onClick}
      class="mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-300"
      classList={{
        // Todo state - empty checkbox
        "border-gray-300 bg-white hover:border-gray-400":
          props.status === "todo",
        // Doing state - blue with dash
        "border-blue-500 bg-blue-500": props.status === "in_progress",
        // Done state - green with checkmark
        "border-green-500 bg-green-500": props.status === "done",
      }}
    >
      <div class="w-full h-full flex items-center justify-center">
        {/* Doing state - horizontal dash */}
        {props.status === "in_progress" && (
          <div class="w-2.5 h-.5 bg-white rounded-full" />
        )}

        {/* Done state - checkmark */}
        {props.status === "done" && (
          <svg
            class="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        )}
      </div>
    </button>
  );
}

export default function View() {
  const [_tasks, { mutate }] = createResource(getTodayTasks);

  const handleTaskStatusChange = async (taskId: string) => {
    const task = _tasks()?.find((t) => t.id === taskId);
    if (!task) return;

    const nextStatus =
      task.status === "todo"
        ? "in_progress"
        : task.status === "in_progress"
        ? "done"
        : "todo"; // Reset from done back to todo if needed

    await updateTaskStatus(taskId, nextStatus);

    // Optimistically update the UI
    mutate((prev) => {
      if (!prev) return prev;
      return prev.map((t) =>
        t.id === taskId ? { ...t, status: nextStatus } : t
      );
    });
  };

  const handleGiveUpTask = async (taskId: string) => {
    await updateTaskStatus(taskId, "todo");

    // Optimistically update the UI
    mutate((prev) => {
      if (!prev) return prev;
      return prev.map((t) => (t.id === taskId ? { ...t, status: "todo" } : t));
    });
  };

  // Get today's date in YYYY-MM-DD format
  const todayString = new Date().toISOString().split("T")[0];

  // Helper function to check if task is assigned to today
  const isAssignedToToday = (task: TaskWithProject) => {
    return task.assignedFor === todayString;
  };

  // Filter and sort tasks by status - only show tasks assigned for today
  const doingTasks = () => {
    if (!_tasks()) return [];
    return _tasks()!
      .filter(
        (task) => task.status === "in_progress" && isAssignedToToday(task)
      )
      .sort((a, b) => {
        const deadlineComparison =
          (a.deadline ? new Date(a.deadline).getTime() : Infinity) -
          (b.deadline ? new Date(b.deadline).getTime() : Infinity);
        if (deadlineComparison !== 0) return deadlineComparison;
        return getPriorityOrder(b.priority) - getPriorityOrder(a.priority);
      });
  };

  const todoTasks = () => {
    if (!_tasks()) return [];
    return _tasks()!
      .filter((task) => task.status === "todo" && isAssignedToToday(task))
      .sort((a, b) => {
        const deadlineComparison =
          (a.deadline ? new Date(a.deadline).getTime() : Infinity) -
          (b.deadline ? new Date(b.deadline).getTime() : Infinity);
        if (deadlineComparison !== 0) return deadlineComparison;
        return getPriorityOrder(b.priority) - getPriorityOrder(a.priority);
      });
  };

  const doneTasks = () => {
    if (!_tasks()) return [];
    return _tasks()!
      .filter((task) => task.status === "done" && isAssignedToToday(task))
      .sort(
        (a, b) =>
          (b.updatedAt ? new Date(b.updatedAt).getTime() : 0) -
          (a.updatedAt ? new Date(a.updatedAt).getTime() : 0)
      ); // Most recently completed first
  };

  const assignedTasks = () => todoTasks(); // All todo tasks are already filtered for today

  const totalTodayTasks = () => {
    if (!_tasks()) return 0;
    return _tasks()!.filter(
      (task) => task.status !== "done" && isAssignedToToday(task)
    ).length;
  };

  return (
    <main class="flex-1 overflow-auto">
      <div class="p-8">
        <div class="mb-6">
          <h1 class="text-2xl font-semibold text-black mb-2">Today</h1>
          <p class="text-gray-600">
            You've got {totalTodayTasks()} task(s) for today.
          </p>
        </div>

        <Suspense
          fallback={
            <div class="space-y-3">
              <For each={Array.from({ length: 3 })}>
                {() => (
                  <div class="bg-gray-100 rounded-lg p-4 animate-pulse h-20" />
                )}
              </For>
            </div>
          }
        >
          <div class="space-y-6">
            {/* Currently Doing Section */}
            <Show when={doingTasks().length > 0}>
              <div>
                <h2 class="text-sm font-semibold text-blue-800 mb-3 uppercase tracking-wider">
                  Currently Doing
                </h2>
                <div class="space-y-3">
                  <For each={doingTasks()}>
                    {(task) => (
                      <div
                        class={`flex flex-col gap-2 rounded-lg p-4 transition-colors ${
                          task.priority === "urgent"
                            ? "bg-blue-50 border border-red-200 hover:border-red-300"
                            : "bg-blue-50 border border-blue-200 hover:border-blue-300"
                        }`}
                      >
                        <div class="flex items-start justify-between">
                          <div class="flex items-start gap-3 flex-1">
                            <TaskCheckbox
                              status={task.status}
                              onClick={() => handleTaskStatusChange(task.id)}
                            />
                            <div class="flex-1 min-w-0">
                              <h3 class="text-sm font-medium text-black mb-1">
                                {task.title}
                              </h3>
                              <div class="text-xs text-gray-500">
                                {getBreadcrumbs(task.projectBreadcrumbs)}
                              </div>
                            </div>
                          </div>
                          <div class="text-right ml-4">
                            <div class="text-xs text-gray-500 mb-1">Due</div>
                            <div class="text-sm font-medium text-black">
                              {formatDate(task.deadline)}
                            </div>
                            <div class="text-xs text-gray-600">
                              {formatTime(task.deadline)}
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center justify-between text-xs">
                          <div class="flex items-center gap-2">
                            <Show when={task.priority === "urgent"}>
                              <span class="text-xs text-red-600 font-medium">
                                URGENT
                              </span>
                            </Show>
                            <div class="text-gray-500">
                              <span class="font-medium">
                                {getRemainingTime(task.deadline)}
                              </span>{" "}
                              remaining
                            </div>
                          </div>
                          <div class="flex items-center gap-2">
                            <button
                              onClick={() => handleGiveUpTask(task.id)}
                              class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              Give up
                            </button>
                            <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              In Progress
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            {/* Assigned Tasks */}
            <Show when={assignedTasks().length > 0}>
              <div>
                <h2 class="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">
                  Assigned for Today
                </h2>
                <div class="space-y-3">
                  <For each={assignedTasks()}>
                    {(task) => (
                      <div
                        class={`flex flex-col gap-2 rounded-lg p-4 transition-colors ${
                          task.priority === "urgent"
                            ? "bg-white border border-red-200 hover:border-red-300"
                            : "bg-white border border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div class="flex items-start justify-between">
                          <div class="flex items-start gap-3 flex-1">
                            <TaskCheckbox
                              status={task.status}
                              onClick={() => handleTaskStatusChange(task.id)}
                            />
                            <div class="flex-1 min-w-0">
                              <h3 class="text-sm font-medium text-black mb-1">
                                {task.title}
                              </h3>
                              <div class="text-xs text-gray-500">
                                {getBreadcrumbs(task.projectBreadcrumbs)}
                              </div>
                            </div>
                          </div>
                          <div class="text-right ml-4">
                            <div class="text-xs text-gray-500 mb-1">Due</div>
                            <div class="text-sm font-medium text-black">
                              {formatDate(task.deadline)}
                            </div>
                            <div class="text-xs text-gray-600">
                              {formatTime(task.deadline)}
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center justify-between text-xs">
                          <div class="flex items-center gap-2">
                            <Show when={task.priority === "urgent"}>
                              <span class="text-xs px-1.5 py-.5 rd-1 bg-red-100 text-red-600 font-medium">
                                URGENT
                              </span>
                            </Show>
                            <div class="text-gray-500">
                              <span class="font-medium">
                                {getRemainingTime(task.deadline)}
                              </span>{" "}
                              remaining
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            {/* Done Tasks */}
            <Show when={doneTasks().length > 0}>
              <div>
                <h2 class="text-sm font-semibold text-green-800 mb-3 uppercase tracking-wider">
                  Completed
                </h2>
                <div class="space-y-3">
                  <For each={doneTasks()}>
                    {(task) => (
                      <div class="bg-green-50 border border-green-200 rounded-lg p-4 opacity-75">
                        <div class="flex items-start justify-between mb-2">
                          <div class="flex items-start gap-3 flex-1">
                            <TaskCheckbox
                              status={task.status}
                              onClick={() => handleTaskStatusChange(task.id)}
                            />
                            <div class="flex-1 min-w-0">
                              <h3 class="text-sm font-medium text-gray-600 line-through mb-1">
                                {task.title}
                              </h3>
                              <div class="text-xs text-gray-400">
                                {getBreadcrumbs(task.projectBreadcrumbs)}
                              </div>
                            </div>
                          </div>
                          <div class="text-right ml-4">
                            <div class="text-xs text-gray-400 mb-1">
                              Completed
                            </div>
                            <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                              Done
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            {/* Empty State */}
            <Show when={!_tasks.loading && totalTodayTasks() === 0}>
              <div class="text-center py-12">
                <div class="text-gray-400 mb-2">
                  <svg
                    class="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p class="text-gray-600">No tasks for today. Great job!</p>
              </div>
            </Show>
          </div>
        </Suspense>
      </div>
    </main>
  );
}
