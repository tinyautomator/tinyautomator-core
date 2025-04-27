import { EmailSubjectField } from "./EmailSubjectField";
import { EmailBodyField } from "./EmailBodyField";

export function EmailComposerFields() {
  return (
    <div className="space-y-4">
      <EmailSubjectField />
      <EmailBodyField />
    </div>
  );
}
