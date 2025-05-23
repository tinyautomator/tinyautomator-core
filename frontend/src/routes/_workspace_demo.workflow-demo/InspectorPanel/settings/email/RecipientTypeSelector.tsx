type InputMode = 'manual' | 'csv' | 'google' | 'contacts';

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
      <label className="text-sm font-medium">Recipient Input Mode</label>
      <select
        className="w-full rounded-md border border-slate-200 p-2 text-sm"
        value={inputMode}
        onChange={e => onInputModeChange(e.target.value as InputMode)}
      >
        <option value="manual">Manual Entry</option>
        <option value="csv">Upload CSV</option>
        <option value="google" disabled>
          Import from Google Sheets (coming soon)
        </option>
        <option value="contacts" disabled>
          Use Saved Contact List (coming soon)
        </option>
      </select>
    </div>
  );
}
