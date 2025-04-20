"use client";
import type { Node } from "@xyflow/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsTab from "./settings/SettingsTab";
import AdvancedTab from "./advanced/AdvancedTab";
import LogsTab from "./logs/LogsTab";

interface InspectorTabsProps {
  selectedNode: Node<{ label: string }>;
}

export function InspectorTabs({ selectedNode }: InspectorTabsProps) {
  return (
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
  );
}
