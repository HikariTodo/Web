import {
  createEffect,
  createRoot,
  createSignal,
  getOwner,
  on,
  onCleanup,
  type Setter,
  type VoidComponent,
} from "solid-js";
import { render } from "solid-js/web";

export type DialogProperties<ReturnData = undefined, Parameters = undefined> = {
  open: boolean;
  setOpen: Setter<boolean>;
  resolve: (data?: ReturnData) => void;
  parameters: Parameters;
};

export function useDialog<ReturnData = undefined, Parameters = undefined>(
  Dialog: VoidComponent<DialogProperties<ReturnData, Parameters>>
) {
  const owner = getOwner();

  const show = (data?: Parameters, cb?: (data?: ReturnData) => void): void => {
    createRoot((dispose) => {
      const [open, setOpen] = createSignal(true);

      createEffect(
        on(open, (open) => {
          if (!open) resolve();
        })
      );

      let disposing = false;
      const resolve = (data?: ReturnData) => {
        if (disposing) return;
        disposing = true;

        if (open()) setOpen(false);
        dispose();

        // wait for 100ms, so it closes before chaining the next dialog.
        if (cb) setTimeout(() => cb?.(data), 100);
      };

      const portal = document.createElement("div");
      document.body.appendChild(portal);

      const free = render(
        () => (
          <Dialog
            open={open()}
            setOpen={setOpen}
            resolve={resolve}
            parameters={data as Parameters}
          />
        ),
        portal
      );

      onCleanup(() => {
        // wait for the dialog animation to be done.
        setTimeout(() => {
          free();
          portal.remove();
        }, 350);
      });
    }, owner);
  };

  const showAndWait = (data?: Parameters): Promise<ReturnData | undefined> => {
    return new Promise((resolve) => show(data, resolve));
  };

  return { show, showAndWait };
}
