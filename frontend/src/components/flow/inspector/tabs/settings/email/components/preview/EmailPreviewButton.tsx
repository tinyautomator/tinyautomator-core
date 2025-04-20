"use client";

import { useEmailContext } from "../../context/EmailContext";
import { EmailPreviewDialog } from "./EmailPreviewDialog";

export function EmailPreviewButton() {
  const {
    isPreviewOpen,
    setIsPreviewOpen,
    recipientString,
    subject,
    body,
    formatPreviewEmails,
  } = useEmailContext();

  return (
    <EmailPreviewDialog
      open={isPreviewOpen}
      onOpenChange={setIsPreviewOpen}
      recipientString={recipientString}
      subject={subject}
      body={body}
      formatPreviewEmails={formatPreviewEmails}
    />
  );
}
