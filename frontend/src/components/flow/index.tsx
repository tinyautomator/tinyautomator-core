"use client";

import type React from "react";
import { useRef, useState, useCallback } from "react";
import {
  ChevronDown,
  Code,
  Cog,
  Database,
  Mail,
  Play,
  Settings,
  Timer,
  Zap,
} from "lucide-react";
import {
  ReactFlowProvider,
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Initial nodes and edges for the flow
const initialNodes: Node<{ label: string }>[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Time Trigger" },
    position: { x: 250, y: 25 },
    style: {
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "10px",
      width: 180,
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    },
  },
  {
    id: "2",
    data: { label: "Send Email" },
    position: { x: 250, y: 150 },
    style: {
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "10px",
      width: 180,
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    style: { stroke: "#6366F1" },
  },
];

// Block categories and items
const blockCategories = [
  {
    name: "Triggers",
    icon: Zap,
    blocks: [
      { id: "time-trigger", name: "Time Trigger", icon: Timer },
      { id: "email-trigger", name: "Email Received", icon: Mail },
      { id: "slack-trigger", name: "Slack Message", icon: Zap },
      { id: "calendar-trigger", name: "Calendar Event", icon: Timer },
      { id: "form-trigger", name: "Form Submission", icon: Database },
    ],
  },
  {
    name: "Actions",
    icon: Cog,
    blocks: [
      { id: "send-email", name: "Send Email", icon: Mail },
      { id: "update-database", name: "Update Spreadsheet", icon: Database },
      { id: "slack-message", name: "Post to Slack", icon: Zap },
      { id: "create-event", name: "Create Calendar Event", icon: Timer },
      { id: "http-request", name: "HTTP Request", icon: Zap },
    ],
  },
  {
    name: "Logic",
    icon: Code,
    blocks: [
      { id: "code-block", name: "JavaScript Code", icon: Code },
      { id: "python-block", name: "Python Code", icon: Code },
      { id: "condition", name: "Condition", icon: Settings },
      { id: "filter", name: "Filter Data", icon: Cog },
      { id: "transform", name: "Transform Data", icon: Cog },
    ],
  },
];

function InnerFlow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<{ label: string }>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<{
    label: string;
  }> | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [nodeId, setNodeId] = useState(3); // Start from 3 since we already have nodes 1 and 2

  const { screenToFlowPosition } = useReactFlow();

  // Fix: Map over addEdge results so that "animated" is always a boolean.
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) =>
        addEdge(params, eds).map((edge) => ({
          ...edge,
          animated: edge.animated ?? false,
        })),
      );
    },
    [setEdges],
  );

  const onNodeClick = (_: React.MouseEvent, node: Node<{ label: string }>) => {
    setSelectedNode(node);
  };

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Use the spread operator to add the new node
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const type = event.dataTransfer.getData("application/reactflow/type");
      const name = event.dataTransfer.getData("application/reactflow/label");

      if (!type || !name) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<{ label: string }> = {
        id: `node-${nodeId}`,
        type: type === "time-trigger" ? "input" : "default",
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
      };

      setNodes((nds) => [...nds, newNode]);
      setNodeId((nid) => nid + 1);
    },
    [nodeId, screenToFlowPosition, setNodes],
  );

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
    nodeLabel: string,
  ) => {
    event.dataTransfer.setData("application/reactflow/type", nodeType);
    event.dataTransfer.setData("application/reactflow/label", nodeLabel);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Blocks Panel */}
      <div className="w-64 border-r bg-white">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-semibold">Blocks</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={debugMode ? "default" : "outline"}
              size="sm"
              onClick={() => setDebugMode(!debugMode)}
            >
              <Play className="mr-1 h-3 w-3" />
              Debug
            </Button>
          </div>
        </div>
        <Separator />
        <ScrollArea className="h-[calc(100vh-8.5rem)]">
          <div className="px-2 py-2">
            {blockCategories.map((category) => (
              <Collapsible key={category.name} defaultOpen className="mb-2">
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100">
                  <div className="flex items-center">
                    <category.icon className="mr-2 h-4 w-4 text-slate-500" />
                    {category.name}
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-1 space-y-1 px-1">
                    {category.blocks.map((block) => (
                      <Card
                        key={block.id}
                        className="cursor-grab border border-slate-200 hover:border-slate-300 hover:shadow-sm"
                        draggable
                        onDragStart={(event) =>
                          onDragStart(
                            event,
                            block.id === "time-trigger" ? "input" : "default",
                            block.name,
                          )
                        }
                      >
                        <CardContent className="flex items-center gap-2 p-3">
                          <block.icon className="h-4 w-4 text-slate-500" />
                          <span className="text-sm">{block.name}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 bg-slate-50">
        <div className="flex h-12 items-center justify-between border-b bg-white px-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium">Untitled Workflow</h2>
            <Badge variant="outline" className="text-xs">
              Draft
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Save
            </Button>
            <Button size="sm">Publish</Button>
          </div>
        </div>
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
            <MiniMap />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>
      </div>

      {/* Right Sidebar - Inspector Panel */}
      <div className="w-80 border-l bg-white">
        <div className="p-4">
          <h2 className="font-semibold">Inspector</h2>
          <p className="text-xs text-muted-foreground">
            Configure the selected block
          </p>
        </div>
        <Separator />
        <ScrollArea className="h-[calc(100vh-8.5rem)]">
          {selectedNode ? (
            <div className="p-4">
              <h3 className="mb-4 text-sm font-medium">
                {selectedNode.data.label} Configuration
              </h3>

              <Tabs defaultValue="settings">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
                </TabsList>
                <TabsContent value="settings" className="space-y-4 pt-4">
                  {selectedNode.data.label === "Send Email" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">To</label>
                        <input
                          type="email"
                          placeholder="recipient@example.com"
                          className="w-full rounded-md border border-slate-200 p-2 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <input
                          type="text"
                          placeholder="Email subject"
                          className="w-full rounded-md border border-slate-200 p-2 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Body</label>
                        <Textarea
                          placeholder="Email content..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </>
                  )}

                  {selectedNode.data.label === "Time Trigger" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Schedule Type
                        </label>
                        <select className="w-full rounded-md border border-slate-200 p-2 text-sm">
                          <option>Interval</option>
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>Monthly</option>
                          <option>Custom Cron</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Run Every</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            defaultValue="15"
                            className="w-20 rounded-md border border-slate-200 p-2 text-sm"
                          />
                          <select className="flex-1 rounded-md border border-slate-200 p-2 text-sm">
                            <option>Minutes</option>
                            <option>Hours</option>
                            <option>Days</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedNode.data.label === "JavaScript Code" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Code</label>
                      <Textarea
                        placeholder="// Write your code here..."
                        className="min-h-[200px] font-mono text-sm"
                        defaultValue={`// Example function
function processData(input) {
  // Transform the input data
  const output = {
    ...input,
    processed: true,
    timestamp: new Date().toISOString()
  };

  return output;
}`}
                      />
                    </div>
                  )}

                  <Button className="w-full">Apply Changes</Button>
                </TabsContent>
                <TabsContent value="advanced" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Node ID</label>
                    <input
                      type="text"
                      value={selectedNode.id}
                      readOnly
                      className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Error Handling
                    </label>
                    <select className="w-full rounded-md border border-slate-200 p-2 text-sm">
                      <option>Stop workflow</option>
                      <option>Continue workflow</option>
                      <option>Retry (max 3 times)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Timeout</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        defaultValue="30"
                        className="w-20 rounded-md border border-slate-200 p-2 text-sm"
                      />
                      <span className="flex items-center text-sm text-slate-500">
                        seconds
                      </span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="logs" className="pt-4">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs font-mono space-y-1">
                      <p className="text-slate-500">
                        [10:15:32] Node initialized
                      </p>
                      <p className="text-slate-500">
                        [10:15:33] Waiting for trigger...
                      </p>
                      <p className="text-green-600">
                        [10:16:01] Trigger activated
                      </p>
                      <p className="text-blue-600">
                        [10:16:02] Processing data...
                      </p>
                      <p className="text-green-600">
                        [10:16:03] Task completed successfully
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-500">
              <Settings className="mb-2 h-10 w-10 text-slate-300" />
              <h3 className="text-sm font-medium">No Block Selected</h3>
              <p className="mt-1 text-xs">
                Select a block on the canvas to configure it
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <InnerFlow />
    </ReactFlowProvider>
  );
}
