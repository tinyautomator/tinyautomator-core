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
import { useFormContext } from "react-hook-form";
import { EmailFormValues } from "./utils/emailValidation";
<<<<<<< HEAD
import { useEmailRecipients } from "./utils/useEmailRecipents";

export function EmailPreview() {
  const { getValues } = useFormContext<EmailFormValues>();
  const { validRecipients } = useEmailRecipients();
  const subject = getValues("subject");
  const body = getValues("message");

  const recipientLengthLimit = 3;
  const formatPreviewRecipients = () => {
    const visible = validRecipients.slice(0, recipientLengthLimit);
    const hiddenCount = validRecipients.length - visible.length;
=======
import { useEmailRecipe } from "./utils/useEmailRecipe";

export function EmailPreview() {
  const { watch } = useFormContext<EmailFormValues>();
  const { recipients } = useEmailRecipe();
  const subject = watch("subject");
  const body = watch("message");

  const recipientLengthLimit = 3;
  const formatPreviewRecipients = () => {
    const visible = recipients.slice(0, recipientLengthLimit);
    const hiddenCount = recipients.length - visible.length;
>>>>>>> 02799ac (feat: send-email block with new inputs and toasts for different ui interactions)

    return hiddenCount > 0
      ? `${visible.join(", ")} +${hiddenCount} more`
      : visible.join(", ");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-6">
          <Eye className="h-3.5 w-3.5 mr-1" />
          Preview Email
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-description="Preview what your email will look like"
        aria-describedby="email preview"
      >
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
        </DialogHeader>
        <div className="p-4 bg-white border rounded-md space-y-2 text-sm">
          <p>
            <strong>To:</strong> {formatPreviewRecipients()}
          </p>
          <p>
            <strong>Subject:</strong> {subject}
          </p>
          <div className="mt-4 p-3 border rounded bg-slate-50 whitespace-pre-wrap">
            {body}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
