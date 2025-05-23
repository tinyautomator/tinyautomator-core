export function LogsPanel() {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-mono space-y-1">
        <p className="text-slate-500">[10:15:32] Node initialized</p>
        <p className="text-slate-500">[10:15:33] Waiting for trigger...</p>
        <p className="text-green-600">[10:16:01] Trigger activated</p>
        <p className="text-blue-600">[10:16:02] Processing data...</p>
        <p className="text-green-600">[10:16:03] Task completed successfully</p>
      </div>
    </div>
  );
}
