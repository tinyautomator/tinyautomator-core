"use client";

import { useCallback, useEffect, useRef } from "react";
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
  workflowId?: number;
  getWorkflowData?: React.MutableRefObject<
    () => {
      nodes: Node[];
      edges: Edge[];
    }
  >;
}

export interface WorkflowRenderResponse {
  nodes: Node<{ label: string; category: string }>[];
  edges: Edge[];
}

export default function FlowCanvas({
  onSelectNode,
  nodeId,
  setNodeId,
  workflowId,
  getWorkflowData,
}: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<
    Node<{ label: string; category: string }>
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

      // decide category & node type
      const category = name === "Time Trigger" ? "trigger" : "action";
      const nodeType = category === "trigger" ? "input" : "output";
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setNodes((nds) => [
        ...nds,
        {
          id: `node-${nodeId}`,
          type: nodeType,
          position,
          data: {
            label: name,
            category,
          },
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

  useEffect(() => {
    if (!workflowId) return;

    const fetchWorkflow = async () => {
      try {
        const res = await fetch(`/api/workflows/${workflowId}/render`);
        const data: WorkflowRenderResponse = await res.json();
        if (!data.nodes || !data.edges) throw new Error("Invalid response");

        const convertCategoryToType = (category: string): Node["type"] => {
          if (category === "trigger") return "input";
          if (category === "action") return "output";
          return "default";
        };

        const formattedNodes = data.nodes.map((n) => ({
          ...n,
          type: convertCategoryToType(n.data.category),
        }));

        setNodes(formattedNodes);
        setEdges(data.edges);
      } catch (err) {
        console.error("Failed to load workflow graph:", err);
      }
    };

    fetchWorkflow();
  }, [workflowId, setNodes, setEdges]);

  useEffect(() => {
    if (!getWorkflowData) return;

    getWorkflowData.current = () => ({
      nodes,
      edges,
    });
  }, [getWorkflowData, nodes, edges]);

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
