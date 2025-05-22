import { MiniMap, useReactFlow } from '@xyflow/react';

import { Background, Controls } from '@xyflow/react';

import { ReactFlow, Node } from '@xyflow/react';
import { NodeUI } from '@/components/shared/NodeUI';
import { useFlowStore } from './flowStore';
import { useCallback, useMemo } from 'react';
import { actionTypeToBlockMap } from './BlockCategories';
import { v4 as uuidv4 } from 'uuid';

export const NodeBuilder = (
  id: string,
  position: { x: number; y: number },
  actionType: string
): Node => {
  const block = actionTypeToBlockMap[actionType];
  return {
    id,
    type: block.node_type,
    position,
    data: {
      actionType,
      config: { provider: 'gmail' },
      label: block.label,
      description: block.description,
      icon: block.icon,
      status:
        block.node_type === 'trigger'
          ? 'success'
          : block.action_type === 'send_email'
            ? 'failed'
            : block.action_type === 'http_request'
              ? 'pending'
              : 'pending',
    },
  };
};

export default function CanvasBody() {
  const nodes = useFlowStore(s => s.nodes);
  const edges = useFlowStore(s => s.edges);
  const onNodesChange = useFlowStore(s => s.onNodesChange);
  const onEdgesChange = useFlowStore(s => s.onEdgesChange);
  const onConnect = useFlowStore(s => s.onConnect);
  const { screenToFlowPosition } = useReactFlow();

  const nodeTypes = useMemo(
    () => ({
      action: NodeUI,
      trigger: NodeUI,
    }),
    []
  );

  const setSelectedNode = useFlowStore(s => s.setSelectedNode);
  const setNodes = useFlowStore(s => s.setNodes);
  const addRecentlyUsedBlock = useFlowStore(s => s.addRecentlyUsedBlock);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setSelectedNode(null);

      const data = JSON.parse(event.dataTransfer.getData('application/reactflow')) as {
        actionType: string;
      };

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = NodeBuilder(uuidv4(), position, data.actionType);

      setNodes([...nodes.map(n => ({ ...n, selected: false })), newNode]);
      addRecentlyUsedBlock(actionTypeToBlockMap[data.actionType]);
    },
    [setSelectedNode, addRecentlyUsedBlock, screenToFlowPosition, setNodes, nodes]
  );

  return (
    <div className="h-14/15">
      <ReactFlow
        minZoom={0.75}
        maxZoom={1.5}
        nodeTypes={nodeTypes}
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
        selectNodesOnDrag={false}
        nodesFocusable={false}
        edgesFocusable={false}
      >
        <Background />
        <Controls />
        <MiniMap nodeColor="#ddd" />
      </ReactFlow>
    </div>
  );
}
