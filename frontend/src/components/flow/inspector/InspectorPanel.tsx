"use client";
import type { Node } from "@xyflow/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronsLeftIcon } from "lucide-react";
import { useState } from "react";

import { InspectorTabs } from "./tabs/InspectorTabs";

interface InspectorPanelProps {
  selectedNode: Node<{ label: string }> | null;
}

export default function InspectorPanel({ selectedNode }: InspectorPanelProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`transition-all duration-300 ${
        expanded ? "w-full sm:w-[600px]" : "w-80"
      } max-w-full`}
    >
      <div className="p-4">
        <h2 className="font-semibold">Inspector</h2>
        <p className="text-xs text-muted-foreground">
          Configure the selected block
        </p>
      </div>
      <div className="border-b border-slate-200" />

      <ScrollArea className="h-[calc(100vh-8.5rem)]">
        <button
          onClick={() => setExpanded((prev: boolean) => !prev)}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition"
          title={expanded ? "Collapse panel" : "Expand panel"}
        >
          <ChevronsLeftIcon
            className={`h-5 w-5 transform transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
        <div className="p-4">
          {selectedNode ? (
            <InspectorTabs selectedNode={selectedNode} />
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
