"use client";

import { EmailChips } from "../shared/EmailChips";
import { validateEmail } from "../../../utils/emailValidation";

interface ManualEmailInputProps {
  emails: string[];
  onEmailsChange: (emails: string[]) => void;
}

export function ManualEmailInput({
  emails,
  onEmailsChange,
}: ManualEmailInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Recipients</label>
      <EmailChips
        emails={emails}
        onEmailsChange={onEmailsChange}
        placeholder="Add recipients (comma separated)"
        validateEmail={validateEmail}
      />
    </div>
  );
}
