"use client";

import { useState } from "react";
import { parseEmailCsv } from "../../utils/csvParser";
import { useEmailContext } from "../../context/EmailContext";
import { RecipientInputSelector } from "./RecipientInputSelector";
import { ManualEmailInput } from "./inputs/ManualEmailInput";
import { CsvEmailInput } from "./inputs/CsvEmailInput";

export function RecipientInputPanel() {
  const {
    recipientList,
    inputMode,
    setInputModeWithReset,
    addRecipients,
    clearRecipients,
  } = useEmailContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleCsvFile = async (file: File) => {
    setIsLoading(true);
    setError(null);

    const result = await parseEmailCsv(file);

    if (result.error) {
      setError(result.error);
    } else if (result.emails.length) {
      addRecipients(result.emails);
    }

    setIsLoading(false);
  };

  const recipientEmails = recipientList.map((e) => e.email);

  return (
    <div className="space-y-4">
      <RecipientInputSelector
        inputMode={inputMode}
        onInputModeChange={setInputModeWithReset}
      />

      {inputMode === "manual" && (
        <ManualEmailInput
          emails={recipientEmails}
          onEmailsChange={(newList) => {
            clearRecipients();
            addRecipients(newList);
          }}
        />
      )}

      {inputMode === "csv" && (
        <CsvEmailInput
          emails={recipientEmails}
          addEmails={addRecipients}
          clearEmails={clearRecipients}
          isLoading={isLoading}
          error={error}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          handleCsvFile={handleCsvFile}
        />
      )}

      {inputMode === "google" && (
        <p className="text-sm text-slate-500 italic">
          Import from Google Sheets will be available soon.
        </p>
      )}

      {inputMode === "contacts" && (
        <p className="text-sm text-slate-500 italic">
          Saved Contact Lists will be available soon.
        </p>
      )}
    </div>
  );
}
