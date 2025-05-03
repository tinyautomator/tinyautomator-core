import { createContext, useContext, useCallback, useState } from "react";
import {
  addEdge,
  type Connection,
  type Edge,
  type Node,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type OnNodesChange,
  type OnEdgesChange,
  MarkerType,
} from "@xyflow/react";

interface NodeData extends Record<string, unknown> {
  label: string;
  category: string;
}

interface FlowContextType {
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNode: Node<NodeData> | null;
  onNodesChange: OnNodesChange<Node<NodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: (params: Edge | Connection) => void;
  onNodeClick: (event: React.MouseEvent, node: Node<NodeData>) => void;
  onPaneClick: () => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
}

const FlowContext = createContext<FlowContextType | null>(null);

export function FlowProvider({ children }: { children: React.ReactNode }) {
  // Node and edge state management
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [nodeId, setNodeId] = useState(1);
  const { screenToFlowPosition } = useReactFlow();

  // Handle node connections
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) =>
        addEdge(
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
          eds,
        ),
      );
    },
    [setEdges],
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<NodeData>) => {
      setSelectedNode(node);
    },
    [],
  );

  // Handle clicking empty canvas
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Handle drag and drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const data = JSON.parse(
        event.dataTransfer.getData("application/reactflow"),
      );

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<NodeData> = {
        id: `node-${nodeId}`,
        type: data.category,
        position,
        data: {
          label: data.label,
          category: data.category,
        },
        style: {
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "10px",
          width: 180,
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setNodeId((prev) => prev + 1);
    },
    [nodeId, setNodes, screenToFlowPosition],
  );

  const value = {
    nodes,
    edges,
    selectedNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onPaneClick,
    onDragOver,
    onDrop,
    setNodes,
    setEdges,
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow() {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("useFlow must be used within a FlowProvider");
  }
  return context;
}
