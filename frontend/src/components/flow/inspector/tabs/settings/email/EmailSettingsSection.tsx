"use client";

import { EmailContextProvider } from "./context/EmailContext";
import { RecipientInputPanel } from "./components/recipients/RecipientInputPanel";
import { EmailComposerFields } from "./components/composer/EmailComposerFields";
import { EmailPreviewButton } from "./components/preview/EmailPreviewButton";

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
