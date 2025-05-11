import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RenderedWorkflow, workflowApi } from "@/api";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Menu } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useFlowStore } from "./flowStore";

export default function CanvasHeader({
  workflowToEdit,
  onCollapseToggle,
  collapsed,
}: {
  workflowToEdit?: RenderedWorkflow;
  onCollapseToggle?: () => void;
  collapsed?: boolean;
}) {
  const { nodes, edges } = useFlowStore();
  const { fitView } = useReactFlow();
  const [name, setName] = useState("");

  return (
    <div className="flex h-1/15 items-center justify-between bg-white px-4">
      <div className="flex items-center gap-2">
        {onCollapseToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => {
              onCollapseToggle();
              setTimeout(() => {
                fitView({
                  duration: 500,
                  minZoom: 0.5,
                  maxZoom: 1.5,
                });
              }, 500);
            }}
            aria-label={
              collapsed ? "Expand block panel" : "Collapse block panel"
            }
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <Input
          type="text"
          placeholder="Enter workflow name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Badge variant="outline" className="text-xs">
          Draft
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (workflowToEdit) {
              workflowApi.updateWorkflow(workflowToEdit.id, {
                name: name || workflowToEdit.name,
                description: workflowToEdit.description,
                nodes: nodes.map((node) => ({
                  id: node.id,
                  type: node.type || "default",
                  position: node.position,
                  data: {
                    label: node.data.label as string,
                    actionType: node.data.actionType as string,
                    config: JSON.stringify(node.data.config),
                  },
                })),
                edges: edges,
              });
            } else {
              workflowApi.createWorkflow({
                name: name,
                description: "New Workflow Description",
                nodes: nodes.map((node) => ({
                  id: node.id,
                  type: node.type || "default",
                  position: node.position,
                  data: {
                    label: node.data.label as string,
                    actionType: node.data.actionType as string,
                    config: JSON.stringify(node.data.config),
                  },
                })),
                edges: edges,
              });
            }
          }}
        >
          Save
        </Button>
        <Button size="sm">Publish</Button>
      </div>
    </div>
  );
}
