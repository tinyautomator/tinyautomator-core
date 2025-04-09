"use client";

import type React from "react";
import { useState, useRef, useCallback } from "react";
import {
  ReactFlowProvider,
  ReactFlow,
  useReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type XYPosition,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

function InnerFlow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [nodeId, setNodeId] = useState(1);

  const { screenToFlowPosition } = useReactFlow();

  const nodeTemplates = [
    { type: "input", label: "Time Trigger Node", className: "bg-blue-100" },
    { type: "default", label: "Action Node", className: "bg-green-100" },
    { type: "output", label: "Output Node", className: "bg-red-100" },
  ];

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDrop = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
    nodeLabel: string,
  ) => {
    event.preventDefault();
    if (!reactFlowWrapper.current) return;

    const position: XYPosition = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode: Node = {
      id: `node-${nodeId}`,
      type: nodeType,
      position,
      data: { label: nodeLabel },
    };

    setNodes((nds) => nds.concat(newNode));
    setNodeId((nid) => nid + 1);
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="flex h-screen">
      <div className="w-72 bg-gray-100 border-r">
        <h2 className="text-md font-bold mb-4 ml-2 p-2">Node Templates</h2>
        <div className="space-y-2">
          {nodeTemplates.map((template, index) => (
            <div
              key={index}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(
                  "application/reactflow/type",
                  template.type,
                );
                event.dataTransfer.setData(
                  "application/reactflow/label",
                  template.label,
                );
              }}
              className={`p-3 rounded cursor-move ${template.className} hover:shadow-md transition-shadow`}
            >
              {template.label}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{ height: 900, width: 1300, padding: 100 }}
        ref={reactFlowWrapper}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={(event) => {
            const nodeType = event.dataTransfer.getData(
              "application/reactflow/type",
            );
            const nodeLabel = event.dataTransfer.getData(
              "application/reactflow/label",
            );
            if (nodeType) {
              onDrop(event, nodeType, nodeLabel);
            }
          }}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function DragAndDropFlow() {
  return (
    <ReactFlowProvider>
      <InnerFlow />
    </ReactFlowProvider>
  );
}
