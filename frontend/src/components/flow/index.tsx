"use client";

import { useState, useRef } from "react";
import BlockPanel from "./BlockPanel";
import FlowCanvas from "./Canvas";
import InspectorPanel from "./InspectorPanel";
import { ReactFlowProvider, type Node, type Edge } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import "@xyflow/react/dist/style.css";

export default function WorkflowBuilder() {
  const [selectedNode, setSelectedNode] = useState<Node<{
    label: string;
  }> | null>(null);
  const [nodeId, setNodeId] = useState(1);

  const getWorkflowData = useRef<() => { nodes: Node[]; edges: Edge[] }>(
    () => ({
      nodes: [],
      edges: [],
    }),
  );

  const handleSave = async () => {
    const { nodes, edges } = getWorkflowData.current();

    const payload = {
      name: "Untitled Workflow", // TODO: Make this dynamic later
      nodes: nodes.map((n) => ({
        id: n.id,
        position: n.position,
        data: {
          label: n.data.label,
          category: n.data.category,
        },
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
    };

    try {
      console.log("Payload being sent:", JSON.stringify(payload, null, 2));
      const res = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data?.id) {
        console.log("Workflow saved:", data.id);
        // TODO: replace with modal or toast
      } else {
        console.error("Save failed:", data);
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar */}
      <BlockPanel />

      {/* Center Canvas + Header */}
      <div className="flex-1 bg-slate-50">
        <div className="flex h-12 items-center justify-between border-b bg-white px-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium">Untitled Workflow</h2>
            <Badge variant="outline" className="text-xs">
              Draft
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button size="sm">Publish</Button>
          </div>
        </div>
        <ReactFlowProvider>
          <FlowCanvas
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            nodeId={nodeId}
            setNodeId={setNodeId}
            getWorkflowData={getWorkflowData}
          />
        </ReactFlowProvider>
      </div>

      {/* Right Sidebar */}
      <InspectorPanel selectedNode={selectedNode} />
    </div>
  );
}
