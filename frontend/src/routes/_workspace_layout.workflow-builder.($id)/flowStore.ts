import { create } from 'zustand';
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
} from '@xyflow/react';
import { Block } from './BlockTypes';

type HandleAnimations = {
  [nodeId: string]: {
    source?: boolean;
    target?: boolean;
  };
};

type FlowState = {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  recentlyUsed: Block[];
  handleAnimations: HandleAnimations;

  setHandleAnimation: (nodeId: string, handleType: 'source' | 'target', value: boolean) => void;
  resetHandleAnimations: () => void;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: Node | null) => void;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;

  addRecentlyUsedBlock: (block: Block) => void;
  clearRecentlyUsed: () => void;
};

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  recentlyUsed: [],
  handleAnimations: {},

  setHandleAnimation: (nodeId, handleType, value) =>
    set(state => ({
      handleAnimations: {
        ...state.handleAnimations,
        [nodeId]: {
          ...state.handleAnimations[nodeId],
          [handleType]: value,
        },
      },
    })),
  resetHandleAnimations: () => set({ handleAnimations: {} }),

  setNodes: nodes => set({ nodes }),
  setEdges: edges =>
    set({
      edges: edges?.map(e => {
        const sourceNode = get().nodes.find(n => n.id === e.source);
        let edgeColor = '#60a5fa'; // default (blue)
        if (sourceNode) {
          if (sourceNode.type === 'trigger') {
            edgeColor = '#d97706'; // amber-600 (same as trigger node)
          } else if (sourceNode.type === 'action') {
            edgeColor = '#9333ea'; // purple-600 (same as action node)
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
      }),
      handleAnimations: computeHandleAnimations(edges),
    }),
  setSelectedNode: node => set({ selectedNode: node }),

  onNodesChange: changes =>
    set(state => ({
      nodes: applyNodeChanges(changes, state.nodes),
    })),

  onEdgesChange: changes =>
    set(state => {
      const newEdges = applyEdgeChanges(changes, state.edges);

      const removedEdgeIds = changes.filter(c => c.type === 'remove').map(c => c.id);

      const removedEdges = state.edges.filter(e => removedEdgeIds.includes(e.id));

      const newHandleAnimations = { ...state.handleAnimations };

      removedEdges.forEach(edge => {
        const stillHasSource = newEdges.some(e => e.source === edge.source);
        if (edge.source && newHandleAnimations[edge.source] && !stillHasSource) {
          newHandleAnimations[edge.source] = {
            ...newHandleAnimations[edge.source],
            source: false,
          };
        }

        const stillHasTarget = newEdges.some(e => e.target === edge.target);
        if (edge.target && newHandleAnimations[edge.target] && !stillHasTarget) {
          newHandleAnimations[edge.target] = {
            ...newHandleAnimations[edge.target],
            target: false,
          };
        }
      });

      return {
        edges: newEdges,
        handleAnimations: newHandleAnimations,
      };
    }),

  onConnect: params => {
    console.log('onConnect', params);
    if (!params.source || !params.target) {
      console.error('Invalid connection params:', params);
      return;
    }

    get().setHandleAnimation(params.source, 'source', true);
    get().setHandleAnimation(params.target, 'target', true);

    set(state => {
      // Find the source node to determine its type
      const sourceNode = state.nodes.find(n => n.id === params.source);
      let edgeColor = '#60a5fa'; // default (blue)
      if (sourceNode) {
        if (sourceNode.type === 'trigger') {
          edgeColor = '#d97706'; // amber-600 (same as trigger node)
        } else if (sourceNode.type === 'action') {
          edgeColor = '#9333ea'; // purple-600 (same as action node)
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
        edges: addEdge(newEdge, Array.isArray(state.edges) ? state.edges : []),
      };
    });
  },

  addRecentlyUsedBlock: block =>
    set(state => {
      const filtered = state.recentlyUsed.filter(b => b.action_type !== block.action_type);
      return {
        recentlyUsed: [block, ...filtered].slice(0, 5),
      };
    }),

  clearRecentlyUsed: () => set({ recentlyUsed: [] }),
}));

function computeHandleAnimations(edges: Edge[]): HandleAnimations {
  const handleAnimations: HandleAnimations = {};
  edges?.forEach(edge => {
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
