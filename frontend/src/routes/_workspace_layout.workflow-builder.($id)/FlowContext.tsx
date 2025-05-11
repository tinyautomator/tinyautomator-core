import {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
} from "react";
import { v4 as uuidv4 } from "uuid";
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
import { RenderedWorkflow } from "@/api/workflow/types";
import { actionTypeToBlockMap } from "./BlockCategories";
import { Block } from "./BlockTypes";

interface FlowContextType {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange;
  onConnect: (params: Edge | Connection) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onPaneClick: () => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  recentlyUsed: Block[];
  addRecentlyUsedBlock: (block: Block) => void;
  clearRecentlyUsed: () => void;
}

const FlowContext = createContext<FlowContextType | null>(null);

const NodeBuilder = (
  id: string,
  position: { x: number; y: number },
  actionType: string,
): Node => {
  const block = actionTypeToBlockMap[actionType];
  return {
    id,
    type: block.node_type,
    position,
    data: {
      actionType,
      label: block.label,
      description: block.description,
      config: "",
      icon: block.icon,
      status:
        block.node_type === "trigger"
          ? "success"
          : block.action_type === "send_email"
            ? "failed"
            : block.action_type === "http_request"
              ? "pending"
              : "pending",
    },
  };
};

export function FlowProvider({
  children,
  workflowToEdit,
}: {
  children: React.ReactNode;
  workflowToEdit?: RenderedWorkflow;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    workflowToEdit?.nodes
      ? workflowToEdit.nodes.map((node) =>
          NodeBuilder(node.id, node.position, node.data.actionType),
        )
      : [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    workflowToEdit?.edges
      ? workflowToEdit.edges.map((edge) => ({
          ...edge,
          id: edge.id,
          animated: true,
          style: { stroke: "#60a5fa" },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#60a5fa",
          },
        }))
      : [],
  );
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [recentlyUsed, setRecentlyUsed] = useState<Block[]>([]);

  const addRecentlyUsedBlock = useCallback((block: Block) => {
    setRecentlyUsed((prev) => {
      const filtered = prev.filter((b) => b.action_type !== block.action_type);
      return [block, ...filtered].slice(0, 5);
    });
  }, []);

  const clearRecentlyUsed = useCallback(() => setRecentlyUsed([]), []);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: `e${params.source}-${params.target}`,
            animated: true,
            style: { stroke: "#60a5fa" },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#60a5fa",
            },
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setSelectedNode(null);

      const data = JSON.parse(
        event.dataTransfer.getData("application/reactflow"),
      ) as {
        actionType: string;
      };

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = NodeBuilder(uuidv4(), position, data.actionType);

      setNodes((nds) => [
        ...nds.map((node) => ({
          ...node,
          selected: false,
        })),
        newNode,
      ]);

      addRecentlyUsedBlock(actionTypeToBlockMap[data.actionType]);
    },
    [setNodes, screenToFlowPosition, addRecentlyUsedBlock],
  );

  const contextValue = useMemo(
    () => ({
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
      recentlyUsed,
      addRecentlyUsedBlock,
      clearRecentlyUsed,
    }),
    [
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
      recentlyUsed,
      addRecentlyUsedBlock,
      clearRecentlyUsed,
    ],
  );

  return (
    <FlowContext.Provider value={contextValue}>{children}</FlowContext.Provider>
  );
}

export function useFlow() {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("useFlow must be used within a FlowProvider");
  }

  return context;
}
