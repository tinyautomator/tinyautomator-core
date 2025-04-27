"use client";

import { EmailContextProvider } from "./context/EmailContext";
import { RecipientInputPanel } from "./RecipientInputPanel";
import { EmailComposerFields } from "./EmailComposerFields";
import { EmailPreviewButton } from "./EmailPreviewButton";

export function EmailSettingsSection() {
  return (
    <EmailContextProvider>
      <div className="space-y-6">
        <RecipientInputPanel />
        <EmailComposerFields />
        <div className="flex justify-end">
          <EmailPreviewButton />
        </div>
      </div>
    </EmailContextProvider>
  );
}
