import { createSignal, type VoidComponent } from "solid-js";
import type { DialogProperties } from "../../hooks/dialog";
import Dialog from "../molecules/Dialog";
import database from "../../database";
import { projects } from "../../database/schema/projects";

const CreateProject: VoidComponent<DialogProperties<{ id: string }>> = (
  props
) => {
  const [title, setTitle] = createSignal("");

  const handleSubmit = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();

    const titleValue = title().trim();
    if (!titleValue) return;

    const [inserted] = await database.client
      .insert(projects)
      .values({
        title: titleValue,
      })
      .returning();

    props.resolve({ id: inserted.id });
  };

  return (
    <Dialog open={props.open} onOpenChange={(open) => props.setOpen(open)}>
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Create Project
        </h3>

        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="A beautiful name for your project!"
              required
            />
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => props.resolve()}
              class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default CreateProject;
