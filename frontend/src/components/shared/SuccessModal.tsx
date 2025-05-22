'use client';

import { CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  workflowId?: string;
  onViewWorkflow?: () => void;
}

export function SuccessModal({
  open,
  onOpenChange,
  title = 'Workflow Saved',
  description = 'Your workflow has been saved successfully.',
  workflowId,
  onViewWorkflow,
}: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center pt-4">{title}</DialogTitle>
          <DialogDescription className="text-center">
            <>
              {description}
              {workflowId && (
                <div className="mt-2">
                  <span className="text-xs font-medium text-muted-foreground">Workflow ID: </span>
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">{workflowId}</code>
                </div>
              )}
            </>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onViewWorkflow && <Button onClick={onViewWorkflow}>View Workflow</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
