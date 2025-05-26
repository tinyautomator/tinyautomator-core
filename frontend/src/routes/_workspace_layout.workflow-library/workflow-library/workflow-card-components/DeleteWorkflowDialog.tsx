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

interface DeleteWorkflowDialogProps {
  workflow: Workflow;
}

export function DeleteWorkflowDialog({ workflow }: DeleteWorkflowDialogProps) {
  const { showDeleteDialog, setShowDeleteDialog } =
    useWorkflowActions(workflow);
  if (!workflow) {
    return null;
  }
  const handleConfirm = () => {
    // TODO: Implement delete workflow
    setShowDeleteDialog(false);
  };
  return (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>
          <DialogTitle className="text-center">Delete Workflow</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to delete{" "}
            <span className="font-medium text-slate-900 dark:text-slate-200">
              "{workflow.title}"
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-center sm:space-x-2 mt-5">
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(false)}
            className="mt-3 sm:mt-0"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white active:translate-y-0.5 transition-all duration-200"
          >
            Delete Workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
