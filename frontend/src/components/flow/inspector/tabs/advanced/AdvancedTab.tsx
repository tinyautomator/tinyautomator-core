import type { Node } from "@xyflow/react";

interface AdvancedTabProps {
  selectedNode: Node<{ label: string }>;
}

export default function AdvancedTab({ selectedNode }: AdvancedTabProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Node ID</label>
        <input
          type="text"
          value={selectedNode.id}
          readOnly
          className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Error Handling</label>
        <select className="w-full rounded-md border border-slate-200 p-2 text-sm">
          <option>Stop workflow</option>
          <option>Continue workflow</option>
          <option>Retry (max 3 times)</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Timeout</label>
        <div className="flex gap-2">
          <input
            type="number"
            defaultValue={30}
            className="w-20 rounded-md border border-slate-200 p-2 text-sm"
          />
          <span className="flex items-center text-sm text-slate-500">
            seconds
          </span>
        </div>
      </div>
    </div>
  );
}
