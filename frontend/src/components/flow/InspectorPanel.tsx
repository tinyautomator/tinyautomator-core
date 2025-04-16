// components/flow/InspectorPanel.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Node } from "@xyflow/react";

interface InspectorPanelProps {
  selectedNode: Node<{ label: string }> | null;
}

export default function InspectorPanel({ selectedNode }: InspectorPanelProps) {
  return (
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
                      defaultValue={`// Placeholder Func`}
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
                  <label className="text-sm font-medium">Error Handling</label>
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
  );
}
