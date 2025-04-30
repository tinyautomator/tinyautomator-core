"use client";

import { useState, useRef } from "react";
import BlockPanel from "./BlockPanel";
import FlowCanvas from "./Canvas";
import InspectorPanel from "./inspector/InspectorPanel";
import { ReactFlowProvider, type Node, type Edge } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SuccessModal } from "./SuccessModal";

import "@xyflow/react/dist/style.css";

export default function WorkflowBuilder() {
  const [selectedNode, setSelectedNode] = useState<Node<{
    label: string;
  }> | null>(null);
  const [nodeId, setNodeId] = useState(1);
  const [successOpen, setSuccessOpen] = useState(false);
  const [savedWorkflowId, setSavedWorkflowId] = useState<string | undefined>();
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");

  const getWorkflowData = useRef<() => { nodes: Node[]; edges: Edge[] }>(
    () => ({
      nodes: [],
      edges: [],
    }),
  );

  const handleSave = async () => {
    const { nodes, edges } = getWorkflowData.current();

    const payload = {
      name: workflowName,
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
    console.log("Payload being sent:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data?.id) {
        setSavedWorkflowId(data.id);
        setSuccessOpen(true);
      } else {
        console.error("Save failed:", data);
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return (
    <>
      <SuccessModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        workflowId={savedWorkflowId}
        onViewWorkflow={() => {
          // TODO: Add routing logic here
          console.log("View workflow clicked!");
        }}
      />

      <div className="flex h-full">
        {/* Left Sidebar */}
        <BlockPanel />

        {/* Center Canvas + Header */}
        <div className="flex-1 bg-slate-50">
          <div className="flex h-12 items-center justify-between border-b bg-white px-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Enter workflow name..."
                className="text-base font-semibold text-slate-800 bg-transparent border border-slate-300 rounded-md px-3 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 hover:border-slate-400 hover:shadow-md transition-all"
              />
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
    </>
  );
}
