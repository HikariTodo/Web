import type { FlowComponent } from "solid-js";
import DesktopDialog from "@corvu/dialog";

const Dialog: FlowComponent<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = (props) => {
  return (
    <DesktopDialog open={props.open} onOpenChange={props.onOpenChange}>
      <DesktopDialog.Portal>
        <DesktopDialog.Overlay class="fixed inset-0 z-50 bg-black/50 data-[open]:(animate-fade-in animate-duration-100) data-[closed]:(animate-fade-out animate-duration-100) " />
        <DesktopDialog.Content class="fixed left-1/2 top-1/2 z-50 min-w-80 -translate-x-1/2 -translate-y-1/2 rounded-lg border-gray-400 bg-gray-100 px-6 py-5 data-[open]:(animate-fade-in animate-duration-150) data-[closed]:(animate-fade-out animate-duration-150)">
          {props.children}
        </DesktopDialog.Content>
      </DesktopDialog.Portal>
    </DesktopDialog>
  );
};

export default Dialog;
