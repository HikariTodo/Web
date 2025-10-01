import SideBar from "../components/SideBar";

export default function View() {
  return (
    <div class="flex h-screen bg-gray-50">
      <SideBar />
      <main class="flex-1 overflow-auto">
        <div class="p-8">
          <h1 class="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h1>
          <p class="text-gray-600">
            Welcome to HikariTodo! Your minimalist task management solution.
          </p>
        </div>
      </main>
    </div>
  );
}
