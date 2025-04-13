import "../../App.css";
import { WorkflowBuilder } from "@/components/flow";

export default function () {
  return (
    <div className="h-full overflow-auto p-6 scrollbar-hidden">
      <WorkflowBuilder></WorkflowBuilder>
    </div>
  );
}
