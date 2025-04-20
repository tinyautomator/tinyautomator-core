"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface EmailPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientString: string;
  subject: string;
  body: string;
  formatPreviewEmails: (emails: string) => string;
  prepareContent?: (input: string) => string;
}

export function EmailPreviewDialog({
  open,
  onOpenChange,
  recipientString,
  subject,
  body,
  formatPreviewEmails,
  prepareContent = (text) => text,
}: EmailPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-6">
          <Eye className="h-3.5 w-3.5 mr-1" />
          Preview Email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
        </DialogHeader>
        <div className="p-4 bg-white border rounded-md space-y-2 text-sm">
          <p>
            <strong>To:</strong>{" "}
            {formatPreviewEmails(prepareContent(recipientString))}
          </p>
          <p>
            <strong>Subject:</strong> {prepareContent(subject)}
          </p>
          <div className="mt-4 p-3 border rounded bg-slate-50 whitespace-pre-wrap">
            {prepareContent(body)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
