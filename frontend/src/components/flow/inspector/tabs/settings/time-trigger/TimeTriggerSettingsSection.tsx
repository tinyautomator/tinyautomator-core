"use client";

export function TimeTriggerSettingsSection() {
  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">Schedule Type</label>
        <select className="w-full rounded-md border border-slate-200 p-2 text-sm">
          <option>Interval</option>
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
          <option>Custom Cron</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Run Every</label>
        <div className="flex gap-2">
          <input
            type="number"
            defaultValue="15"
            className="w-20 rounded-md border border-slate-200 p-2 text-sm"
          />
          <select className="flex-1 rounded-md border border-slate-200 p-2 text-sm">
            <option>Minutes</option>
            <option>Hours</option>
            <option>Days</option>
          </select>
        </div>
      </div>
    </div>
  );
}
