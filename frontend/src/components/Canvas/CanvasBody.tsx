import { MiniMap, useReactFlow } from "@xyflow/react";

import { Background, Controls } from "@xyflow/react";

import { ReactFlow, Node } from "@xyflow/react";
import { NodeUI } from "@/components/shared/NodeUI";
import { useFlowStore } from "./flowStore";
import { useCallback, useEffect, useMemo } from "react";
import { nodeTypeToBlockMap } from "../../components/shared/BlockCategories";
import { v4 as uuidv4 } from "uuid";
import { useOutletContext } from "react-router";
import { LayoutActions } from "@/routes/_workspace_layout._workflow_canvas/route";
import { Config } from "@/api/workflow/types";

export const NodeBuilder = (
  id: string,
  position: { x: number; y: number },
  category: string,
  nodeType: string,
  config: Config,
): Node => {
  const block = nodeTypeToBlockMap[nodeType];
  return {
    id,
    type: block.category,
    position,
    data: {
      category,
      nodeType,
      config,
      label: block.label,
      description: block.description,
      icon: block.icon,
      status: block.status,
    },
  };
};

export default function CanvasBody() {
  const nodes = useFlowStore((s) => s.getNodes());
  const edges = useFlowStore((s) => s.getEdges());
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const { open, toggleBlockPanel, toggleInspectorPanel } =
    useOutletContext<LayoutActions>();

  useEffect(() => {
    setTimeout(() => {
      fitView({
        duration: 500,
        minZoom: 0.5,
        maxZoom: 1.5,
      });
    }, 500);
  }, [fitView, open, toggleBlockPanel, toggleInspectorPanel]);

  const nodeTypes = useMemo(
    () => ({
      action: NodeUI,
      trigger: NodeUI,
    }),
    [],
  );

  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const setNodes = useFlowStore((s) => s.setNodes);
  const addRecentlyUsedBlock = useFlowStore((s) => s.addRecentlyUsedBlock);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    [setSelectedNode],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

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
        category: string;
        nodeType: string;
      };

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = NodeBuilder(
        uuidv4(),
        position,
        data.category,
        data.nodeType,
        {},
      );

      setNodes([...nodes.map((n) => ({ ...n, selected: false })), newNode]);
      addRecentlyUsedBlock(nodeTypeToBlockMap[data.nodeType]);
    },
    [
      setSelectedNode,
      addRecentlyUsedBlock,
      screenToFlowPosition,
      setNodes,
      nodes,
    ],
  );

  return (
    <div className="h-14/15 dark:bg-background">
      <ReactFlow
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
        attributionPosition="top-right"
      >
        <Background />
        <Controls />
        <MiniMap nodeColor="#ddd" />
      </ReactFlow>
    </div>
  );
}
