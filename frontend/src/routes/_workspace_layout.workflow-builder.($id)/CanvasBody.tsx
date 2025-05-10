import { MiniMap } from "@xyflow/react";

import { Background, Controls } from "@xyflow/react";

import { ReactFlow } from "@xyflow/react";
import { useFlow } from "./FlowContext";
import { NodeUI } from "@/components/shared/NodeUI";

export default function CanvasBody() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onPaneClick,
    onDragOver,
    onDrop,
  } = useFlow();

  const nodeTypes = {
    action: NodeUI,
    trigger: NodeUI,
  };

  return (
    <div className="h-14/15">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        nodeTypes={nodeTypes}
      >
        <Background />
        <Controls />
        <MiniMap nodeColor="#ddd" />
      </ReactFlow>
    </div>
  );
}
