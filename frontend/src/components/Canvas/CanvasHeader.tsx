import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Config, RenderedWorkflow, workflowApi } from "@/api";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Menu, Pencil } from "lucide-react";
import { useFlowStore } from "@/components/Canvas/flowStore";
import { toast } from "sonner";

export default function CanvasHeader({
  workflow,
  onCollapseToggle,
  collapsed,
}: {
  workflow?: RenderedWorkflow;
  onCollapseToggle?: () => void;
  collapsed?: boolean;
}) {
  const nodes = useFlowStore((s) => s.getNodes());
  const edges = useFlowStore((s) => s.getEdges());
  const [name, setName] = useState(workflow?.name || "");
  const [editing, setEditing] = useState(workflow?.name ? false : true);

  const handleSaveWorkflow = async () => {
    if (workflow) {
      workflowApi.updateWorkflow(workflow.id, {
        name: name || workflow.name,
        description: workflow.description,
        nodes: nodes.map((node) => ({
          id: node.id,
          category: node.data.category as string,
          node_type: node.data.nodeType as string,
          config: node.data.config as Config,
          position: node.position,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source_node_id: edge.source,
          target_node_id: edge.target,
        })),
      });
      toast.success("Workflow updated successfully");
    } else {
      workflowApi.createWorkflow({
        name: name,
        description: "New Workflow Description",
        status: "draft",
        nodes: nodes.map((node) => ({
          id: node.id,
          category: node.data.category as string,
          node_type: node.data.nodeType as string,
          config: node.data.config as Config,
          position: node.position,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source_node_id: edge.source,
          target_node_id: edge.target,
        })),
      });
      toast.success("Workflow saved successfully");
    }
  };

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
            }}
            aria-label={
              collapsed ? "Expand block panel" : "Collapse block panel"
            }
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        {(workflow?.name || name) && !editing ? (
          <div className="flex items-center gap-2">
            <h4 className="text-md tracking-tighter text-gray-800 leading-tight">
              {name}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditing(true);
              }}
            >
              <Pencil className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          editing && (
            <Input
              type="text"
              placeholder="Enter workflow name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveWorkflow();
                  setEditing(false);
                  setName(name);
                }
              }}
            />
          )
        )}
        <Badge variant="outline" className="text-xs">
          Draft
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            handleSaveWorkflow();
            setName(name);
            setEditing(false);
          }}
        >
          Save
        </Button>
        <Button size="sm">Publish</Button>
      </div>
    </div>
  );
}
