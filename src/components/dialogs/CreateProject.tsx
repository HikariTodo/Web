import { createSignal, type VoidComponent } from "solid-js";
import type { DialogProperties } from "../../hooks/dialog";
import Dialog from "../molecules/Dialog";
import database from "../../database";
import { projects } from "../../database/schema/projects";

const CreateProject: VoidComponent<DialogProperties<{ id: string }>> = (
  props
) => {
  const [title, setTitle] = createSignal("");

  const handleCreation = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();

    const value = title().trim();
    if (!value) return;

    const [inserted] = await database.client
      .insert(projects)
      .values({
        title: value,
      })
      .returning();

    props.resolve({ id: inserted.id });
  };

  return (
    <Dialog open={props.open} onOpenChange={(open) => props.setOpen(open)}>
      <form onSubmit={handleCreation}>
        <input
          type="text"
          placeholder="A beautiful name for your project!"
          value={title()}
          onInput={(event) => setTitle(event.currentTarget.value)}
        />
        <button type="submit">Create</button>
      </form>
    </Dialog>
  );
};

export default CreateProject;
