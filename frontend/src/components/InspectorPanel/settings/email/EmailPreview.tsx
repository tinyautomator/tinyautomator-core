import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { EmailFormValues, parseEmail } from "./utils/emailValidation";

export function EmailPreview() {
  const { getValues } = useFormContext<EmailFormValues>();
  const recipients = getValues("recipients");
  const subject = getValues("subject");
  const body = getValues("message");

  const validRecipients = recipients.filter(
    (email) => parseEmail(email) !== null
  );

  const recipientLengthLimit = 3;
  const formatPreviewRecipients = () => {
    const visible = validRecipients.slice(0, recipientLengthLimit);
    const hiddenCount = validRecipients.length - visible.length;

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
          <DialogDescription>
            This is a preview of the email that will be sent to your recipients.
          </DialogDescription>
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
