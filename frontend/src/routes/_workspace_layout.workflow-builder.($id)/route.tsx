import { ReactFlowProvider } from "@xyflow/react";
import "../../App.css";
import "@xyflow/react/dist/style.css";
import BlockPanel from "./BlockPanel";
import InspectorPanel from "./InspectorPanel";
import { FlowProvider } from "./FlowContext";
import { Route } from "./+types/route";
import { Separator } from "@/components/ui/separator";
import CanvasBody from "./CanvasBody";
import CanvasHeader from "./CanvasHeader";
import { workflowApi } from "@/api";
import { useState } from "react";
import { cn } from "@/lib/utils";

export async function loader({ params }: Route.LoaderArgs) {
  if (params.id) {
    const workflowToEdit = await workflowApi.renderWorkflow(params.id);
    console.log(workflowToEdit);
    workflowToEdit?.nodes?.forEach((node) => {
      console.log(node.data);
      node.data.config = JSON.parse(node.data.config);
    });
    return workflowToEdit;
  }
}

export default function WorkflowBuilder({
  loaderData: workflowToEdit,
}: Route.ComponentProps) {
  const [blockPanelOpen, setBlockPanelOpen] = useState(true);
  return (
    <div className="flex h-full">
      <ReactFlowProvider>
        <FlowProvider workflowToEdit={workflowToEdit}>
          <div
            className={cn(
              "transition-all duration-300 overflow-hidden bg-white dark:bg-gray-900 flex flex-col h-full",
              blockPanelOpen
                ? "w-64 border-r border-gray-200 dark:border-gray-800"
                : "w-0 border-none",
            )}
          >
            <div
              className={`${blockPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"} transition-opacity duration-300 h-full`}
            >
              <BlockPanel />
            </div>
          </div>
          <div className="flex-1 bg-slate-50 flex flex-col">
            <CanvasHeader
              workflowToEdit={workflowToEdit}
              onCollapseToggle={() => setBlockPanelOpen((open) => !open)}
              collapsed={!blockPanelOpen}
            />
            <Separator />
            <CanvasBody />
          </div>
          <InspectorPanel />
        </FlowProvider>
      </ReactFlowProvider>
    </div>
  );
}
