import { EmailSubjectField } from "./fields/EmailSubjectField";
import { EmailBodyField } from "./fields/EmailBodyField";

export function EmailComposerFields() {
  return (
    <div className="space-y-4">
      <EmailSubjectField />
      <EmailBodyField />
    </div>
  );
}
