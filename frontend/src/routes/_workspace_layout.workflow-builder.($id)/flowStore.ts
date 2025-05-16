import { create } from "zustand";
import {
  type Node,
  Edge,
  Connection,
  addEdge,
  MarkerType,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import { Block } from "./BlockTypes";

type FlowState = {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  recentlyUsed: Block[];

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: Node | null) => void;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;

  addRecentlyUsedBlock: (block: Block) => void;
  clearRecentlyUsed: () => void;
};

export const useFlowStore = create<FlowState>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  recentlyUsed: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (node) => set({ selectedNode: node }),

  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    })),

  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),

  onConnect: (params) => {
    console.log("onConnect", params);
    if (!params.source || !params.target) {
      console.error("Invalid connection params:", params);
      return;
    }
    set((state) => {
      const newEdge: Edge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        animated: true,
        style: { stroke: "#60a5fa" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#60a5fa",
        },
      };
      return {
        edges: addEdge(newEdge, Array.isArray(state.edges) ? state.edges : [])
      };
    });
  },

  addRecentlyUsedBlock: (block) =>
    set((state) => {
      const filtered = state.recentlyUsed.filter(
        (b) => b.action_type !== block.action_type,
      );
      return {
        recentlyUsed: [block, ...filtered].slice(0, 5),
      };
    }),

  clearRecentlyUsed: () => set({ recentlyUsed: [] }),
}));
