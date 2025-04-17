"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Node } from "@xyflow/react";
import SettingsTab from "./InspectorTabs/SettingsTab";
import AdvancedTab from "./InspectorTabs/AdvancedTab";
import LogsTab from "./InspectorTabs/LogsTab";

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
      <div className="border-b border-slate-200" />

      <ScrollArea className="h-[calc(100vh-8.5rem)]">
        <div className="p-4">
          {selectedNode ? (
            <>
              <h3 className="mb-4 text-sm font-medium">
                {selectedNode.data.label} Configuration
              </h3>

              <Tabs defaultValue="settings">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="settings">
                  <SettingsTab node={selectedNode} />
                </TabsContent>

                <TabsContent value="advanced">
                  <AdvancedTab selectedNode={selectedNode} />
                </TabsContent>

                <TabsContent value="logs">
                  <LogsTab />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-20">
              No block selected.
              <br /> Click a node to inspect it.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
