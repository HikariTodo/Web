import SideBar from "../components/SideBar";

export default function View() {
  return (
    <div class="flex h-screen bg-gray-50">
      <SideBar />
      <main class="flex-1 overflow-auto">
        <div class="p-8">
          <h1 class="text-2xl font-semibold text-gray-900 mb-4">Today</h1>
          <p class="text-gray-600">You've got 0 task(s) to do.</p>
        </div>
      </main>
    </div>
  );
}
