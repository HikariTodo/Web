import SideBar from "../components/SideBar";
import { For, createSignal } from "solid-js";

// Mock data for tasks - replace with actual data later
const mockTasks = [
  {
    id: 1,
    title: "Review quarterly reports",
    deadline: "2025-10-01",
    priority: "high",
    project: "Work",
    assignedToToday: false,
  },
  {
    id: 2,
    title: "Plan vacation itinerary",
    deadline: "2025-10-03",
    priority: "medium",
    project: "Personal",
    assignedToToday: false,
  },
  {
    id: 3,
    title: "Update website content",
    deadline: "2025-10-02",
    priority: "high",
    project: "Work",
    assignedToToday: false,
  },
  {
    id: 4,
    title: "Buy groceries",
    deadline: "2025-10-05",
    priority: "low",
    project: "Personal",
    assignedToToday: false,
  },
  {
    id: 5,
    title: "Schedule dentist appointment",
    deadline: "2025-10-02",
    priority: "medium",
    project: "Personal",
    assignedToToday: false,
  },
  {
    id: 6,
    title: "Prepare presentation slides",
    deadline: "2025-10-04",
    priority: "high",
    project: "Work",
    assignedToToday: false,
  },
];

function getPriorityOrder(priority: string) {
  switch (priority) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    default:
      return 0;
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "text-red-600";
    case "medium":
      return "text-orange-600";
    case "low":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  }
}

export default function Overview() {
  const [tasks] = createSignal(mockTasks);

  // Filter unassigned tasks and sort by deadline, then by priority
  const sortedTasks = () => {
    return tasks()
      .filter((task) => !task.assignedToToday)
      .sort((a, b) => {
        // First sort by deadline
        const deadlineComparison =
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        if (deadlineComparison !== 0) {
          return deadlineComparison;
        }
        // Then sort by priority (high to low)
        return getPriorityOrder(b.priority) - getPriorityOrder(a.priority);
      });
  };

  return (
    <div class="flex h-screen bg-gray-50">
      <SideBar />
      <main class="flex-1 overflow-auto">
        <div class="p-8">
          <div class="mb-6">
            <h1 class="text-2xl font-semibold text-black mb-2">Overview</h1>
            <p class="text-gray-600">
              All unassigned tasks sorted by deadline and priority
            </p>
          </div>

          <div class="space-y-3">
            <For each={sortedTasks()}>
              {(task) => (
                <div class="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-sm font-medium text-black mb-1">
                        {task.title}
                      </h3>
                      <div class="flex items-center gap-3 text-xs text-gray-500">
                        <span class="bg-gray-100 px-2 py-1 rounded">
                          {task.project}
                        </span>
                        <span class={getPriorityColor(task.priority)}>
                          {task.priority} priority
                        </span>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-xs text-gray-500 mb-1">Due</div>
                      <div class="text-sm font-medium text-black">
                        {formatDate(task.deadline)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </For>

            {sortedTasks().length === 0 && (
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
                <p class="text-gray-600">
                  All tasks are assigned or completed!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
