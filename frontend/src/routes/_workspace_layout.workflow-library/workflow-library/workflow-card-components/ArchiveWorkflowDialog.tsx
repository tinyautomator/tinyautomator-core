import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Workflow } from "../../route";
import { useWorkflowActions } from "../hooks/useWorkflowActions";
import { Dispatch, SetStateAction } from "react";

interface ArchiveWorkflowDialogProps {
  workflow: Workflow | null;
  isArchiving: boolean;
  setArchivingWorkflow: Dispatch<SetStateAction<Workflow | null>>;
}

export function ArchiveWorkflowDialog({
  workflow,
  isArchiving,
  setArchivingWorkflow,
}: ArchiveWorkflowDialogProps) {
  if (!workflow) {
    return null;
  }
  const { handleArchive } = useWorkflowActions(workflow);

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleArchive();
    setArchivingWorkflow(null);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setArchivingWorkflow(null);
  };

  return (
    <Dialog
      open={isArchiving}
      onOpenChange={(open) => {
        if (!open) {
          setArchivingWorkflow(null);
        }
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>
          <DialogTitle className="text-center text-lg font-semibold">
            Archive Workflow
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-slate-600 dark:text-slate-400 mt-2">
            Are you sure you want to archive{" "}
            <span className="font-medium text-slate-900 dark:text-slate-200">
              {workflow.title}
            </span>
            ? This action cannot be undone. Archived workflows are still
            accessible in the archive tab.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-center sm:space-x-2 mt-6">
          <Button
            variant="outline"
            className="mt-3 sm:mt-0"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white active:translate-y-0.5 transition-all duration-200"
          >
            Archive Workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
