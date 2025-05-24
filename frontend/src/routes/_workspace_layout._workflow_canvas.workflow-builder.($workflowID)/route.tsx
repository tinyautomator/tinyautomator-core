import { MarkerType } from "@xyflow/react";
import "../../App.css";
import "@xyflow/react/dist/style.css";
import BlockPanel from "./BlockPanel";
import InspectorPanel from "@/components/InspectorPanel";
import { Separator } from "@/components/ui/separator";
import CanvasBody, { NodeBuilder } from "@/components/Canvas/CanvasBody";
import CanvasHeader from "@/components/Canvas/CanvasHeader";
import { workflowApi } from "@/api";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/components/Canvas/flowStore";
import { useLayoutContext } from "../_workspace_layout._workflow_canvas/useLayoutContext";
import { Route } from "./+types/route";

export async function loader({ params }: Route.LoaderArgs) {
  if (params.id) {
    return await workflowApi.renderWorkflow(params.id);
  }
}

export default function WorkflowBuilder({
  loaderData: workflowToEdit,
}: Route.ComponentProps) {
  const setNodes = useFlowStore((s) => s.setNodes);
  const setEdges = useFlowStore((s) => s.setEdges);
  const {
    toggleBlockPanel,
    setToggleBlockPanel,
    searchFocused,
    setSearchFocused,
    toggleInspectorPanel,
    setToggleInspectorPanel,
  } = useLayoutContext();

  useEffect(() => {
    if (workflowToEdit) {
      const parsedNodes = workflowToEdit.nodes.map((n) => {
        return NodeBuilder(n.id, n.position, n.action_type);
      });

      setNodes(parsedNodes);
      setEdges(
        workflowToEdit.edges?.map((edge) => ({
          ...edge,
          id: edge.id,
          source: edge.source_node_id,
          target: edge.target_node_id,
          animated: true,
          style: { stroke: "#60a5fa" },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#60a5fa",
          },
        })),
      );
    }
  }, [workflowToEdit, setNodes, setEdges]);

  return (
    <div className="flex h-full overflow-hidden">
      <div
        className={cn(
          "transition-all duration-300 overflow-hidden bg-white dark:bg-gray-900 flex flex-col h-full max-w-72",
          toggleBlockPanel
            ? "w-72 pointer-events-auto"
            : "w-0 pointer-events-none",
        )}
      >
        <BlockPanel
          searchFocused={searchFocused}
          setSearchFocused={setSearchFocused}
          blockPanelOpen={toggleBlockPanel}
        />
      </div>
      <div className="flex-1 bg-slate-50 flex flex-col">
        <CanvasHeader
          workflow={workflowToEdit}
          onCollapseToggle={() => setToggleBlockPanel((open) => !open)}
          collapsed={!toggleBlockPanel}
        />
        <Separator />
        <CanvasBody />
      </div>
      <InspectorPanel
        toggleInspectorPanel={toggleInspectorPanel}
        setToggleInspectorPanel={setToggleInspectorPanel}
      />
    </div>
  );
}
