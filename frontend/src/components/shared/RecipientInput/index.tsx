import { useState } from "react";
import { RecipientTypeSelector } from "./RecipientTypeSelector";
import { RecipientChips } from "./RecipientChips";
import { RecipientInputField } from "./RecipientInputField";
import { CsvUploader } from "./CsvUploader";
import { FormLabel } from "@/components/ui/form";

type InputMode = "manual" | "csv" | "google" | "contacts";

export function RecipientInputSection({ ...field }) {
  const [inputMode, setInputMode] = useState<InputMode>("manual");

  return (
    <div className="space-y-4">
      <RecipientTypeSelector
        inputMode={inputMode}
        onInputModeChange={setInputMode}
      />
      {/* TODO: Move this logic to a separate component */}
      {inputMode === "csv" && <CsvUploader {...field} />}

      <RecipientChips {...field} />
      <FormLabel>Recipients</FormLabel>
      <RecipientInputField {...field} />
    </div>
  );
}
