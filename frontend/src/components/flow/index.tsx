// components/flow/InnerFlow.tsx
"use client";

import { useState } from "react";
import BlockPanel from "./BlockPanel";
import FlowCanvas from "./Canvas";
import InspectorPanel from "./inspector/InspectorPanel";
import { ReactFlowProvider, type Node } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import "@xyflow/react/dist/style.css";

export default function WorkflowBuilder() {
  const [selectedNode, setSelectedNode] = useState<Node<{
    label: string;
  }> | null>(null);
  const [nodeId, setNodeId] = useState(1);

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
            <Button variant="outline" size="sm">
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
          />
        </ReactFlowProvider>
      </div>

      {/* Right Sidebar */}
      <InspectorPanel selectedNode={selectedNode} />
    </div>
  );
}
