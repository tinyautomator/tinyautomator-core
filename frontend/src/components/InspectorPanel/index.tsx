import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, ChevronsRight } from "lucide-react";
import { useFlowStore } from "@/components/Canvas/flowStore";
import { AdvancedSettings } from "./AdvancedSettings";
import { LogsPanel } from "./LogsPanel";
import { SettingsTab } from "./settings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useReactFlow } from "@xyflow/react";

const minWidth = 300;
const maxWidth = 800;

export default function InspectorPanel({
  toggleInspectorPanel,
  setToggleInspectorPanel,
}: {
  toggleInspectorPanel: boolean;
  setToggleInspectorPanel: (
    value: boolean | ((prev: boolean) => boolean),
  ) => void;
}) {
  const [showPanel, setShowPanel] = useState(true);
  const [width, setWidth] = useState(minWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [z, setZ] = useState(false);

  const startX = useRef(0);
  const startWidth = useRef(0);
  const timeRef = useRef(0);

  const { getSelectedNode } = useFlowStore();
  const { fitView } = useReactFlow();

  const handleButtonMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = width;
    timeRef.current = new Date().getTime();
  };

  useEffect(() => {
    if (!isResizing) {
      setTimeout(() => {
        fitView({
          duration: 500,
          minZoom: 0.5,
          maxZoom: 1.5,
        });
      }, 500);
    }
  }, [fitView, isResizing]);

  useEffect(() => {
    if (!toggleInspectorPanel) {
      setShowPanel(false);
      setWidth(0);
      setZ(false);
    } else {
      setShowPanel(true);
      setWidth(minWidth);
    }
  }, [toggleInspectorPanel]);

  useEffect(() => {
    if (width) {
      setToggleInspectorPanel(true);
      setShowPanel(true);
    }
  }, [width, setShowPanel, setToggleInspectorPanel]);

  useEffect(() => {
    let newWidth: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX.current;
      newWidth = Math.max(startWidth.current - deltaX);

      if (!showPanel) {
        if (newWidth >= minWidth) {
          setZ(true);
        }
        if (newWidth >= maxWidth) {
          setWidth(maxWidth);
        } else {
          setWidth(newWidth);
        }
      } else {
        if (newWidth <= minWidth) {
          setWidth(minWidth);
        } else if (newWidth >= maxWidth) {
          setWidth(maxWidth);
        } else {
          setWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      const endTime = new Date().getTime();
      const duration = endTime - timeRef.current;

      if (duration > 300) {
        // holding down
        if (newWidth < minWidth && newWidth > 0) {
          setWidth(minWidth);
        }
      } else {
        // click
        if (showPanel) {
          setZ(false);
        }
        setShowPanel((prev) => !prev);
        if (width) {
          setWidth(0);
        } else {
          setWidth(minWidth);
        }
      }
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={
        {
          "--my-width": `${width}px`,
          // maxWidth: `${maxWidth}px`,
          minWidth: z
            ? toggleInspectorPanel
              ? `${minWidth}px`
              : "0px"
            : "0px",
        } as React.CSSProperties
      }
      className={cn(
        "relative h-full select-none",
        !isResizing && "transition-all duration-500",
        "w-[var(--my-width)]",
      )}
    >
      {/* Collapse button - only visible when expanded, outside sidebar */}
      <div
        style={{
          right: showPanel
            ? z
              ? `${Math.min(Math.max(width, minWidth), maxWidth)}px`
              : `${width}px`
            : 0,
        }}
        className={cn(
          "fixed top-4/23 z-50",
          !isResizing && "transition-all duration-500",
          showPanel ? "translate-x-1/2" : "w-13",
        )}
      >
        <Button
          variant="ghost"
          onMouseDown={handleButtonMouseDown}
          className={cn(
            "bg-white shadow-lg border border-slate-200 flex items-center justify-center",
            "transition-colors duration-100 hover:bg-slate-200",
            "transition-[width,height,border-radius] duration-500",
            showPanel ? "h-10 w-10 rounded-full" : "h-13 w-13 rounded-l-full",
          )}
          aria-label="Collapse inspector"
        >
          <ChevronsRight
            className={cn(
              "text-slate-600 transition-all duration-500 group-hover:scale-110 !h-6 !w-6",
              showPanel ? "rotate-0" : "rotate-180",
            )}
          />
        </Button>
      </div>

      {/* Panel container - always rendered */}
      <div
        className={
          "h-full border-l bg-white dark:bg-background w-full whitespace-nowrap"
        }
      >
        {/* Panel content - always rendered, animate only opacity */}
        <div
          className={cn(
            "h-full",
            showPanel ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <div className="h-13 pl-5 flex flex-col justify-between">
            <h2 className="font-semibold pt-1">Inspector</h2>
            <p className="text-xs text-muted-foreground pb-1">
              Configure the selected block
            </p>
          </div>
          <Separator />
          <ScrollArea className="h-[calc(100vh-8.5rem)]">
            {getSelectedNode() ? (
              <div className="p-4">
                <h3 className="mb-4 text-sm font-medium">
                  {getSelectedNode()?.data.label as string} Configuration
                </h3>

                <Tabs defaultValue="settings">
                  <div className="flex items-center justify-center">
                    <TabsList className="w-11/12">
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                      <TabsTrigger value="logs">Logs</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="settings" className="space-y-4 pt-4">
                    <SettingsTab />
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 pt-4">
                    <AdvancedSettings
                      nodeId={getSelectedNode()?.id as string}
                    />
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
