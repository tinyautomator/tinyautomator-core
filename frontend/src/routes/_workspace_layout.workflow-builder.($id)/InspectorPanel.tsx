import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Settings, ChevronsRight } from "lucide-react";
import { useFlow } from "@/routes/_workspace_layout.workflow-builder.($id)/FlowContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function InspectorPanel() {
  const { selectedNode } = useFlow();
  const [toggleExpanded, setToggleExpanded] = useState(true);

  return (
    <div className="relative h-full">
      {/* Collapse button - only visible when expanded, outside sidebar */}
      <div
        className={cn(
          "fixed top-1/6 z-50 transition-all duration-1000",
          toggleExpanded ? "right-80 !translate-x-1/2" : "right-0 w-13",
        )}
      >
        <Button
          variant="ghost"
          onClick={() => setToggleExpanded(!toggleExpanded)}
          className={cn(
            "bg-white shadow-lg border border-slate-200 flex items-center justify-center",
            "transition-colors duration-100 hover:bg-slate-200",
            "transition-[width,height,border-radius] duration-1000",
            toggleExpanded
              ? "h-10 w-10 rounded-full"
              : "h-13 w-13 rounded-l-full",
          )}
          aria-label="Collapse inspector"
        >
          <ChevronsRight
            className={cn(
              "text-slate-600 transition-all duration-1000 group-hover:scale-110 !h-6 !w-6",
              toggleExpanded ? "rotate-0" : "rotate-180",
            )}
          />
        </Button>
      </div>

      {/* Panel container - always rendered */}
      <div
        className={cn(
          "h-full border-l bg-white transition-all duration-1000 overflow-hidden",
          toggleExpanded ? "w-80" : "w-0",
        )}
      >
        {/* Panel content - always rendered, animate only opacity */}
        <div
          className={cn(
            "h-full w-80",
            toggleExpanded ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <div className="h-1/15 pl-5 flex flex-col justify-between">
            <h2 className="pt-2 font-semibold">Inspector</h2>
            <p className="pb-2 text-xs text-muted-foreground">
              Configure the selected block
            </p>
          </div>
          <Separator />
          <ScrollArea className="h-[calc(100vh-8.5rem)]">
            {selectedNode ? (
              <div className="p-4">
                <h3 className="mb-4 text-sm font-medium">
                  {selectedNode.data.label as string} Configuration
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
                          <label className="text-sm font-medium">
                            Run Every
                          </label>
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
    </div>
  );
}
