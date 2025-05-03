import { useState } from "react";
import { blockCategories } from "./BlockCategories.tsx";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";

export default function BlockPanel() {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {},
  );

  const toggleCategory = (name: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
    nodeLabel: string,
  ) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ category: nodeType, label: nodeLabel }),
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-64 h-full border-r bg-white">
      <div className="flex items-center justify-between p-4">
        <h2 className="font-semibold">Blocks</h2>
      </div>
      <Separator />
      <ScrollArea className="h-full">
        <div className="px-2 py-2">
          {blockCategories.map((category) => {
            const isOpen = openCategories[category.name] ?? true;
            return (
              <Collapsible
                key={category.name}
                open={isOpen}
                onOpenChange={() => toggleCategory(category.name)}
                className="mb-2"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100">
                  <div className="flex items-center">
                    <category.icon className="mr-2 h-4 w-4 text-slate-500" />
                    {category.name}
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
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
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
