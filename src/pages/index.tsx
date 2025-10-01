import SideBar from "../components/SideBar";
import { For, createSignal } from "solid-js";

// Mock data for tasks - replace with actual data later
const mockTasks = [
  {
    id: 1,
    title: "Review quarterly reports",
    deadline: "2025-10-02T15:30:00",
    priority: "high",
    project: "Work",
    subproject: "Client Projects",
    assignedToToday: false,
    status: "todo",
  },
  {
    id: 2,
    title: "Morning workout",
    deadline: "2025-10-05T07:00:00",
    priority: "low",
    project: "Personal",
    subproject: "Health & Fitness",
    assignedToToday: true,
    status: "doing",
  },
  {
    id: 3,
    title: "Update website content",
    deadline: "2025-10-02T12:00:00",
    priority: "high",
    project: "Work",
    assignedToToday: false,
    status: "todo",
  },
  {
    id: 4,
    title: "Call client about project update",
    deadline: "2025-10-03T14:00:00",
    priority: "high",
    project: "Work",
    subproject: "Client Projects",
    assignedToToday: true,
    status: "todo",
  },
  {
    id: 5,
    title: "Schedule dentist appointment",
    deadline: "2025-10-02T17:00:00",
    priority: "high",
    project: "Personal",
    assignedToToday: false,
    status: "done",
  },
  {
    id: 6,
    title: "Plan weekend activities",
    deadline: "2025-10-04T10:00:00",
    priority: "low",
    project: "Personal",
    assignedToToday: true,
    status: "todo",
  },
];

function getPriorityOrder(priority: string) {
  switch (priority) {
    case "high":
      return 2;
    case "low":
      return 1;
    default:
      return 0;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString(void 0, {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
}

function getRemainingTime(dateString: string) {
  const deadline = new Date(dateString);
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

function getBreadcrumbs(project: string, subproject?: string) {
  if (subproject) {
    return `${project} → ${subproject}`;
  }
  return project;
}

export default function View() {
  const [tasks, setTasks] = createSignal(mockTasks);

  const handleTaskStatusChange = (taskId: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const nextStatus =
            task.status === "todo"
              ? "doing"
              : task.status === "doing"
              ? "done"
              : "todo"; // Reset from done back to todo if needed

          return { ...task, status: nextStatus };
        }
        return task;
      })
    );
  };

  // Get today's date in YYYY-MM-DD format
  const todayString = new Date().toISOString().split("T")[0];

  // Filter and sort tasks by status
  const getTodayTasks = () => {
    return tasks().filter(
      (task) => task.assignedToToday || task.deadline.startsWith(todayString)
    );
  };

  const doingTasks = () =>
    getTodayTasks()
      .filter((task) => task.status === "doing")
      .sort((a, b) => {
        const deadlineComparison =
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        if (deadlineComparison !== 0) return deadlineComparison;
        return getPriorityOrder(b.priority) - getPriorityOrder(a.priority);
      });

  const todoTasks = () =>
    getTodayTasks()
      .filter((task) => task.status === "todo")
      .sort((a, b) => {
        const deadlineComparison =
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        if (deadlineComparison !== 0) return deadlineComparison;
        return getPriorityOrder(b.priority) - getPriorityOrder(a.priority);
      });

  const doneTasks = () =>
    getTodayTasks()
      .filter((task) => task.status === "done")
      .sort(
        (a, b) =>
          new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
      ); // Most recently completed first

  const assignedTasks = () =>
    todoTasks().filter((task) => task.assignedToToday);
  const dueTasks = () =>
    todoTasks().filter(
      (task) => task.deadline.startsWith(todayString) && !task.assignedToToday
    );

  const totalTodayTasks = () =>
    getTodayTasks().filter((task) => task.status !== "done").length;

  return (
    <div class="flex h-screen bg-gray-50">
      <SideBar />
      <main class="flex-1 overflow-auto">
        <div class="p-8">
          <div class="mb-6">
            <h1 class="text-2xl font-semibold text-black mb-2">Today</h1>
            <p class="text-gray-600">
              You've got {totalTodayTasks()} task(s) for today.
            </p>
          </div>

          <div class="space-y-6">
            {/* Currently Doing Section */}
            {doingTasks().length > 0 && (
              <div>
                <h2 class="text-sm font-semibold text-blue-800 mb-3 uppercase tracking-wider">
                  Currently Doing
                </h2>
                <div class="space-y-3">
                  <For each={doingTasks()}>
                    {(task) => (
                      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div class="flex items-start justify-between mb-2">
                          <div class="flex items-start gap-3 flex-1">
                            <button
                              onClick={() => handleTaskStatusChange(task.id)}
                              class="mt-1 flex-shrink-0"
                            >
                              <div class="w-4 h-4 border-2 border-blue-500 rounded bg-blue-500 flex items-center justify-center">
                                <svg
                                  class="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                  />
                                </svg>
                              </div>
                            </button>
                            <div class="flex-1 min-w-0">
                              <h3 class="text-sm font-medium text-black mb-1">
                                {task.title}
                              </h3>
                              <div class="text-xs text-gray-500">
                                {getBreadcrumbs(task.project, task.subproject)}
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
                            {task.priority === "high" && (
                              <span class="text-xs text-red-600 font-medium">
                                URGENT
                              </span>
                            )}
                            <div class="text-gray-500">
                              <span class="font-medium">
                                {getRemainingTime(task.deadline)}
                              </span>{" "}
                              remaining
                            </div>
                          </div>
                          <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                            In Progress
                          </span>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}

            {/* Assigned Tasks */}
            {assignedTasks().length > 0 && (
              <div>
                <h2 class="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">
                  Assigned for Today
                </h2>
                <div class="space-y-3">
                  <For each={assignedTasks()}>
                    {(task) => (
                      <div class="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div class="flex items-start justify-between mb-2">
                          <div class="flex items-start gap-3 flex-1">
                            <button
                              onClick={() => handleTaskStatusChange(task.id)}
                              class="mt-1 flex-shrink-0"
                            >
                              <div class="w-4 h-4 border-2 border-gray-300 rounded hover:border-gray-400 transition-colors" />
                            </button>
                            <div class="flex-1 min-w-0">
                              <h3 class="text-sm font-medium text-black mb-1">
                                {task.title}
                              </h3>
                              <div class="text-xs text-gray-500">
                                {getBreadcrumbs(task.project, task.subproject)}
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
                            {task.priority === "high" && (
                              <span class="text-xs px-1.5 py-.5 rd-1 bg-red-100 text-red-600 font-medium">
                                URGENT
                              </span>
                            )}
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
            )}

            {/* Due Today */}
            {dueTasks().length > 0 && (
              <div>
                <h2 class="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">
                  Due Today
                </h2>
                <div class="space-y-3">
                  <For each={dueTasks()}>
                    {(task) => (
                      <div class="bg-white border border-red-200 rounded-lg p-4 hover:border-red-300 transition-colors">
                        <div class="flex items-start justify-between mb-2">
                          <div class="flex items-start gap-3 flex-1">
                            <button
                              onClick={() => handleTaskStatusChange(task.id)}
                              class="mt-1 flex-shrink-0"
                            >
                              <div class="w-4 h-4 border-2 border-gray-300 rounded hover:border-gray-400 transition-colors" />
                            </button>
                            <div class="flex-1 min-w-0">
                              <h3 class="text-sm font-medium text-black mb-1">
                                {task.title}
                              </h3>
                              <div class="text-xs text-gray-500">
                                {getBreadcrumbs(task.project, task.subproject)}
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
                            {task.priority === "high" && (
                              <span class="text-xs text-red-600 font-medium">
                                URGENT
                              </span>
                            )}
                            <div class="text-gray-500">
                              <span class="font-medium text-red-600">
                                {getRemainingTime(task.deadline)}
                              </span>{" "}
                              remaining
                            </div>
                          </div>
                          <span class="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                            Due Today
                          </span>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}

            {/* Done Tasks */}
            {doneTasks().length > 0 && (
              <div>
                <h2 class="text-sm font-semibold text-green-800 mb-3 uppercase tracking-wider">
                  Completed Today
                </h2>
                <div class="space-y-3">
                  <For each={doneTasks()}>
                    {(task) => (
                      <div class="bg-green-50 border border-green-200 rounded-lg p-4 opacity-75">
                        <div class="flex items-start justify-between mb-2">
                          <div class="flex items-start gap-3 flex-1">
                            <button
                              onClick={() => handleTaskStatusChange(task.id)}
                              class="mt-1 flex-shrink-0"
                            >
                              <div class="w-4 h-4 border-2 border-green-500 rounded bg-green-500 flex items-center justify-center">
                                <svg
                                  class="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                  />
                                </svg>
                              </div>
                            </button>
                            <div class="flex-1 min-w-0">
                              <h3 class="text-sm font-medium text-gray-600 line-through mb-1">
                                {task.title}
                              </h3>
                              <div class="text-xs text-gray-400">
                                {getBreadcrumbs(task.project, task.subproject)}
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
            )}

            {/* Empty State */}
            {getTodayTasks().filter((task) => task.status !== "done").length ===
              0 && (
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
