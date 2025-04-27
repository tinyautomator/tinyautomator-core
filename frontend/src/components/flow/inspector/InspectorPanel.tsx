"use client";

import type { Node } from "@xyflow/react";
import { ExpandablePanel } from "@/components/shared/ExpandablePanel";
import { InspectorTabs } from "./tabs/InspectorTabs";
import { Settings2 } from "lucide-react";

interface InspectorPanelProps {
  selectedNode: Node<{ label: string }> | null;
}

export default function InspectorPanel({ selectedNode }: InspectorPanelProps) {
  return (
    <ExpandablePanel
      direction="left"
      size="lg"
      className="bg-background border-l border-border"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Inspector</h2>
            <p className="text-sm text-muted-foreground">
              {selectedNode
                ? `Editing: ${selectedNode.data?.label || selectedNode.id}`
                : "Select a block to configure"}
            </p>
          </div>
        </div>

        <div className="border-b border-border" />

        <div>
          {selectedNode ? (
            <InspectorTabs selectedNode={selectedNode} />
          ) : (
            <div className="text-sm text-muted-foreground text-center py-12">
              No block selected.
              <br />
              Click a node to inspect it.
            </div>
          )}
        </div>
      </div>
    </ExpandablePanel>
  );
}
