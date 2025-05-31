import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Config, RenderedWorkflow, workflowApi } from "@/api";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Menu, Pencil } from "lucide-react";
import { useFlowStore } from "@/components/Canvas/flowStore";
import { toast } from "sonner";
import { useNavigate } from "react-router";

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
  const [editingName, setEditingName] = useState(!workflow?.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const handleSaveName = () => {
    setEditingName(false);
    setName(name.trim());
  };

  const handleEditName = () => {
    setEditingName(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSaveName();
    if (e.key === "Escape") setEditingName(false);
  };

  const handleSaveWorkflow = async () => {
    try {
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
      } else {
        const response = await workflowApi.createWorkflow({
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
        navigate(`/workflow-builder/${response.id}`);
      }
      toast.success("Workflow saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save workflow");
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
            onClick={onCollapseToggle}
            aria-label={
              collapsed ? "Expand block panel" : "Collapse block panel"
            }
          >
            <Menu />
          </Button>
        )}
        {editingName ? (
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter workflow name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleInputKeyDown}
            className="w-48"
          />
        ) : (
          <div className="flex items-center gap-2">
            <h4 className="text-md tracking-tighter text-gray-800 leading-tight">
              {name}
            </h4>
            <Button variant="ghost" size="icon" onClick={handleEditName}>
              <Pencil className="w-5 h-5" />
            </Button>
          </div>
        )}
        <Badge variant="outline" className="text-xs">
          Draft
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleSaveWorkflow}>
          Save
        </Button>
        <Button size="sm">Publish</Button>
      </div>
    </div>
  );
}
