// components/flow/FlowCanvas.tsx
"use client";

import { useCallback, useRef } from "react";
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";

interface FlowCanvasProps {
  selectedNode: Node<{ label: string }> | null;
  onSelectNode: (node: Node<{ label: string }>) => void;
  nodeId: number;
  setNodeId: (cb: (prev: number) => number) => void;
}

export default function FlowCanvas({
  onSelectNode,
  nodeId,
  setNodeId,
}: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<
    Node<{ label: string }>
  >([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => [
        ...eds,
        {
          ...params,
          id: `e${params.source}-${params.target}`,
          animated: true,
          style: { stroke: "#6366F1" },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#6366F1",
          },
        },
      ]);
    },
    [setEdges],
  );

  const onNodeClick = (_: React.MouseEvent, node: Node<{ label: string }>) => {
    onSelectNode(node);
  };

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;

      const name = event.dataTransfer.getData("application/reactflow/label");
      if (!name) return;

      const type: Node["type"] =
        name === "Time Trigger"
          ? "input"
          : name === "Send Email"
            ? "output"
            : "default";

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setNodes((nds) => [
        ...nds,
        {
          id: `node-${nodeId}`,
          type,
          position,
          data: { label: name },
          style: {
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px",
            width: 180,
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          },
        },
      ]);

      setNodeId((nid) => nid + 1);
    },
    [nodeId, screenToFlowPosition, setNodes, setNodeId],
  );

  return (
    <div className="h-[calc(100%-3rem)] w-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
      >
        <Controls />
        <Background color="#fff" gap={16} />
      </ReactFlow>
    </div>
  );
}
