import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, ChevronsRight } from "lucide-react";
import { useFlowStore } from "@/routes/_workspace_layout.workflow-builder.($id)/flowStore";
import { AdvancedSettings } from "./AdvancedSettings";
import { LogsPanel } from "./LogsPanel";
import { SettingsTab } from "./settings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";

export default function InspectorPanel({
  toggleInspectorPanel,
  setToggleInspectorPanel,
}: {
  toggleInspectorPanel: boolean;
  setToggleInspectorPanel: (toggleInspectorPanel: boolean) => void;
}) {
  const { selectedNode } = useFlowStore();
  const { fitView } = useReactFlow();

  return (
    <div
      className={cn(
        "relative h-full transition-all duration-500",
        toggleInspectorPanel ? "w-80" : "w-0",
      )}
    >
      {/* Collapse button - only visible when expanded, outside sidebar */}
      <div
        className={cn(
          "fixed top-1/6 z-50 transition-all duration-500",
          toggleInspectorPanel ? "right-80 !translate-x-1/2" : "right-0 w-13",
        )}
      >
        <Button
          variant="ghost"
          onClick={() => {
            setToggleInspectorPanel(!toggleInspectorPanel);
            setTimeout(() => {
              fitView({
                padding: 0.2,
                duration: 500,
                minZoom: 0.5,
                maxZoom: 1.5,
              });
            }, 500);
          }}
          className={cn(
            "bg-white shadow-lg border border-slate-200 flex items-center justify-center",
            "transition-colors duration-100 hover:bg-slate-200",
            "transition-[width,height,border-radius] duration-500",
            toggleInspectorPanel
              ? "h-10 w-10 rounded-full"
              : "h-13 w-13 rounded-l-full",
          )}
          aria-label="Collapse inspector"
        >
          <ChevronsRight
            className={cn(
              "text-slate-600 transition-all duration-500 group-hover:scale-110 !h-6 !w-6",
              toggleInspectorPanel ? "rotate-0" : "rotate-180",
            )}
          />
        </Button>
      </div>

      {/* Panel container - always rendered */}
      <div
        className={cn(
          "h-full border-l bg-white transition-all duration-500 overflow-hidden",
          toggleInspectorPanel ? "w-80" : "w-0",
        )}
      >
        {/* Panel content - always rendered, animate only opacity */}
        <div
          className={cn(
            "h-full w-80",
            toggleInspectorPanel
              ? "pointer-events-auto"
              : "pointer-events-none",
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
                    <SettingsTab />
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 pt-4">
                    <AdvancedSettings nodeId={selectedNode.id} />
                  </TabsContent>

                  <TabsContent value="logs" className="pt-4">
                    <LogsPanel />
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
