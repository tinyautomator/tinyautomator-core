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
import { Block } from "../../routes/_workspace_layout._workflow_canvas.workflow-builder.($workflowID)/BlockTypes";

type HandleAnimations = {
  [nodeId: string]: {
    source?: boolean;
    target?: boolean;
  };
};

type NodeStatus = {
  [nodeId: string]: string;
};

type FlowData = {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  recentlyUsed: Block[];
  handleAnimations: HandleAnimations;
  nodeStatus: NodeStatus;
};

type FlowState = {
  // Internal keyed state
  flows: Record<string, FlowData>;
  currentKey: string | null;

  // Initialize a flow and set it as current
  initializeFlow: (key: string) => void;
  getCurrentKey: () => string | null;
  clearFlow: (key?: string) => void; // Optional key, defaults to current

  // Original API - all methods now use currentKey internally
  getNodes: () => Node[];
  getEdges: () => Edge[];
  getSelectedNode: () => Node | null;
  getRecentlyUsed: () => Block[];
  getHandleAnimations: () => HandleAnimations;
  getCurrentNodeStatus: () => NodeStatus;

  setHandleAnimation: (
    nodeId: string,
    handleType: "source" | "target",
    value: boolean,
  ) => void;
  resetHandleAnimations: () => void;

  getNodeStatus: (nodeId: string) => string;
  setNodeStatus: (nodeId: string, status: string) => void;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: Node | null) => void;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;

  addRecentlyUsedBlock: (block: Block) => void;
  clearRecentlyUsed: () => void;
};

const defaultFlowData: FlowData = {
  nodes: [],
  edges: [],
  selectedNode: null,
  recentlyUsed: [],
  handleAnimations: {},
  nodeStatus: {},
};

export const useFlowStore = create<FlowState>((set, get) => ({
  flows: {},
  currentKey: null,

  initializeFlow: (key: string) => {
    set((state) => ({
      currentKey: key,
      flows: {
        ...state.flows,
        [key]: state.flows[key] || { ...defaultFlowData },
      },
    }));
  },

  getCurrentKey: () => get().currentKey,

  clearFlow: (key?: string) => {
    const keyToUse = key || get().currentKey;
    if (!keyToUse) return;

    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [keyToUse]: _, ...rest } = state.flows;
      return {
        flows: rest,
        currentKey: state.currentKey === keyToUse ? null : state.currentKey,
      };
    });
  },

  // Helper functions that return current flow data
  getNodes: () => {
    const state = get();
    const currentKey = state.currentKey;
    return currentKey ? state.flows[currentKey]?.nodes || [] : [];
  },

  getEdges: () => {
    const state = get();
    const currentKey = state.currentKey;
    return currentKey ? state.flows[currentKey]?.edges || [] : [];
  },

  getSelectedNode: () => {
    const state = get();
    const currentKey = state.currentKey;
    return currentKey ? state.flows[currentKey]?.selectedNode || null : null;
  },

  getRecentlyUsed: () => {
    const state = get();
    const currentKey = state.currentKey;
    return currentKey ? state.flows[currentKey]?.recentlyUsed || [] : [];
  },

  getHandleAnimations: () => {
    const state = get();
    const currentKey = state.currentKey;
    return currentKey ? state.flows[currentKey]?.handleAnimations || {} : {};
  },

  getCurrentNodeStatus: () => {
    const state = get();
    const currentKey = state.currentKey;
    return currentKey ? state.flows[currentKey]?.nodeStatus || {} : {};
  },

  getNodeStatus: (nodeId: string) => {
    const currentKey = get().currentKey;
    return currentKey
      ? get().flows[currentKey]?.nodeStatus[nodeId] || "pending"
      : "pending";
  },

  setNodeStatus: (nodeId: string, status: string) => {
    const currentKey = get().currentKey;
    if (!currentKey) return;

    set((state) => ({
      flows: {
        ...state.flows,
        [currentKey]: {
          ...state.flows[currentKey],
          nodeStatus: {
            ...state.flows[currentKey]?.nodeStatus,
            [nodeId]: status,
          },
        },
      },
    }));
  },

  setHandleAnimation: (
    nodeId: string,
    handleType: "source" | "target",
    value: boolean,
  ) => {
    const currentKey = get().currentKey;
    if (!currentKey) return;

    set((state) => ({
      flows: {
        ...state.flows,
        [currentKey]: {
          ...state.flows[currentKey],
          handleAnimations: {
            ...state.flows[currentKey]?.handleAnimations,
            [nodeId]: {
              ...state.flows[currentKey]?.handleAnimations?.[nodeId],
              [handleType]: value,
            },
          },
        },
      },
    }));
  },

  resetHandleAnimations: () => {
    const currentKey = get().currentKey;
    if (!currentKey) return;

    set((state) => ({
      flows: {
        ...state.flows,
        [currentKey]: {
          ...state.flows[currentKey],
          handleAnimations: {},
        },
      },
    }));
  },

  setNodes: (nodes: Node[]) => {
    const currentKey = get().currentKey;
    if (!currentKey) return;

    set((state) => ({
      flows: {
        ...state.flows,
        [currentKey]: {
          ...state.flows[currentKey],
          nodes,
        },
      },
    }));
  },

  setEdges: (edges: Edge[]) => {
    const currentKey = get().currentKey;
    if (!currentKey) return;

    set((state) => {
      const flowData = state.flows[currentKey];
      const nodes = flowData?.nodes || [];

      const processedEdges = edges?.map((e) => {
        const sourceNode = nodes.find((n) => n.id === e.source);
        let edgeColor = "#60a5fa"; // default (blue)
        if (sourceNode) {
          if (sourceNode.type === "trigger") {
            edgeColor = "#d97706"; // amber-600 (same as trigger node)
          } else if (sourceNode.type === "action") {
            edgeColor = "#9333ea"; // purple-600 (same as action node)
          }
        }
        return {
          ...e,
          animated: true,
          style: { stroke: edgeColor },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
          },
        };
      });

      return {
        flows: {
          ...state.flows,
          [currentKey]: {
            ...state.flows[currentKey],
            edges: processedEdges,
            handleAnimations: computeHandleAnimations(processedEdges),
          },
        },
      };
    });
  },

  setSelectedNode: (node: Node | null) => {
    const currentKey = get().currentKey;
    if (!currentKey) return;

    set((state) => ({
      flows: {
        ...state.flows,
        [currentKey]: {
          ...state.flows[currentKey],
          selectedNode: node,
        },
      },
    }));
  },

  onNodesChange: (changes: NodeChange[]) => {
    const currentKey = get().currentKey;
    if (!currentKey) return;

    set((state) => {
      const flowData = state.flows[currentKey];
      if (!flowData) return state;

      return {
        flows: {
          ...state.flows,
          [currentKey]: {
            ...flowData,
            nodes: applyNodeChanges(changes, flowData.nodes),
          },
        },
      };
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    const currentKey = get().currentKey;
    if (!currentKey) return;

    set((state) => {
      const flowData = state.flows[currentKey];
      if (!flowData) return state;

      const newEdges = applyEdgeChanges(changes, flowData.edges);

      const removedEdgeIds = changes
        .filter((c) => c.type === "remove")
        .map((c) => c.id);

      const removedEdges = flowData.edges.filter((e) =>
        removedEdgeIds.includes(e.id),
      );

      const newHandleAnimations = { ...flowData.handleAnimations };

      removedEdges.forEach((edge) => {
        const stillHasSource = newEdges.some((e) => e.source === edge.source);
        if (
          edge.source &&
          newHandleAnimations[edge.source] &&
          !stillHasSource
        ) {
          newHandleAnimations[edge.source] = {
            ...newHandleAnimations[edge.source],
            source: false,
          };
        }

        const stillHasTarget = newEdges.some((e) => e.target === edge.target);
        if (
          edge.target &&
          newHandleAnimations[edge.target] &&
          !stillHasTarget
        ) {
          newHandleAnimations[edge.target] = {
            ...newHandleAnimations[edge.target],
            target: false,
          };
        }
      });

      return {
        flows: {
          ...state.flows,
          [currentKey]: {
            ...flowData,
            edges: newEdges,
            handleAnimations: newHandleAnimations,
          },
        },
      };
    });
  },

  onConnect: (params: Connection) => {
    console.log("onConnect", params);
    if (!params.source || !params.target) {
      console.error("Invalid connection params:", params);
      return;
    }

    const currentKey = get().currentKey;
    if (!currentKey) return;

    // Set handle animations
    get().setHandleAnimation(params.source, "source", true);
    get().setHandleAnimation(params.target, "target", true);

    set((state) => {
      const flowData = state.flows[currentKey];
      if (!flowData) return state;

      // Find the source node to determine its type
      const sourceNode = flowData.nodes.find((n) => n.id === params.source);
      let edgeColor = "#60a5fa"; // default (blue)
      if (sourceNode) {
        if (sourceNode.type === "trigger") {
          edgeColor = "#d97706"; // amber-600 (same as trigger node)
        } else if (sourceNode.type === "action") {
          edgeColor = "#9333ea"; // purple-600 (same as action node)
        }
      }

      const newEdge: Edge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        animated: true,
        style: { stroke: edgeColor },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColor,
        },
      };

      return {
        flows: {
          ...state.flows,
          [currentKey]: {
            ...flowData,
            edges: addEdge(
              newEdge,
              Array.isArray(flowData.edges) ? flowData.edges : [],
            ),
          },
        },
      };
    });
  },

  addRecentlyUsedBlock: (block: Block) => {
    const currentKey = get().currentKey;
    if (!currentKey) return;

    set((state) => {
      const flowData = state.flows[currentKey];
      if (!flowData) return state;

      const filtered = flowData.recentlyUsed.filter(
        (b) => b.action_type !== block.action_type,
      );

      return {
        flows: {
          ...state.flows,
          [currentKey]: {
            ...flowData,
            recentlyUsed: [block, ...filtered].slice(0, 5),
          },
        },
      };
    });
  },

  clearRecentlyUsed: () => {
    const currentKey = get().currentKey;
    if (!currentKey) return;

    set((state) => ({
      flows: {
        ...state.flows,
        [currentKey]: {
          ...state.flows[currentKey],
          recentlyUsed: [],
        },
      },
    }));
  },
}));

function computeHandleAnimations(edges: Edge[]): HandleAnimations {
  const handleAnimations: HandleAnimations = {};
  edges?.forEach((edge) => {
    if (edge.source) {
      handleAnimations[edge.source] = {
        ...(handleAnimations[edge.source] || {}),
        source: true,
      };
    }
    if (edge.target) {
      handleAnimations[edge.target] = {
        ...(handleAnimations[edge.target] || {}),
        target: true,
      };
    }
  });
  return handleAnimations;
}
