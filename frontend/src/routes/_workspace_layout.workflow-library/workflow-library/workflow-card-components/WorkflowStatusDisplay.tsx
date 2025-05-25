import { WORKFLOW_STATUS_CONFIG } from "./workflow-card.constants";

import { WorkflowStatus } from "./workflow-card.constants";
interface StatusBadgeProps {
  status: WorkflowStatus;
}

export function WorkflowStatusBadge({ status }: StatusBadgeProps) {
  const config = WORKFLOW_STATUS_CONFIG[status];

  return (
    <div
      className={`inline-flex items-center px-2.5 py-1 rounded-md ${config.bgColor} ${config.textColor} cursor-pointer transition-all duration-200 hover:opacity-90`}
    >
      <div
        className={`flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} mr-1.5`}
      >
        <config.icon className="w-2.5 h-2.5 text-white fill-zinc-100" />
      </div>
      <span className="font-medium text-xs capitalize whitespace-nowrap">
        {status}
      </span>
    </div>
  );
}
