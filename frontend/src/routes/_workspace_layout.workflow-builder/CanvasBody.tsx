import { MiniMap } from "@xyflow/react";

import { Background, Controls } from "@xyflow/react";

import { ReactFlow } from "@xyflow/react";
import { useFlow } from "./FlowContext";

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
      >
        <Background />
        <Controls />
        <MiniMap nodeColor="#ddd" />
      </ReactFlow>
    </div>
  );
}
