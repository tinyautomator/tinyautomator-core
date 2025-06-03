type InputMode = "manual" | "csv" | "google" | "contacts";

interface RecipientInputSelectorProps {
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
}

export function RecipientTypeSelector({
  inputMode,
  onInputModeChange,
}: RecipientInputSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block mb-1">
        Recipient Input Mode
      </label>
      <select
        className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        value={inputMode}
        onChange={(e) => onInputModeChange(e.target.value as InputMode)}
      >
        <option value="manual">Manual Entry</option>
        <option value="csv">Upload CSV</option>
        <option value="google" disabled>
          Import from Google Sheets (Coming Soon)
        </option>
        <option value="contacts" disabled>
          Use Saved Contact List (Coming Soon)
        </option>
      </select>
    </div>
  );
}
