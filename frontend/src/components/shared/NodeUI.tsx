import "@xyflow/react/dist/style.css";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader,
  LucideProps,
} from "lucide-react";
import { RefAttributes } from "react";
import { cn } from "@/lib/utils";

const statusVariants = {
  success: {
    icon: CheckCircle2,
    color: "text-green-500",
  },
  failed: {
    icon: AlertCircle,
    color: "text-red-500",
  },
  pending: {
    icon: Clock,
    color: "text-yellow-500",
  },
  running: {
    icon: Loader,
    color: "text-blue-400",
  },
};

export function NodeUI({ type, data, selected, height, width }: NodeProps) {
  const getIcon = () => {
    const Icon = data.icon as React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
    return Icon ? <Icon size={16} /> : null;
  };

  const StatusIcon = data.status
    ? statusVariants[data.status as keyof typeof statusVariants].icon
    : statusVariants.success.icon;

  const rx = 8;
  const strokeWidth = 3;
  const dashLength =
    0.3 * (2 * ((width as number) + (height as number) - 2 * rx)); // 30% of perimeter
  const gapLength =
    0.7 * (2 * ((width as number) + (height as number) - 2 * rx)); // 70% of perimeter
  const perimeter = 2 * ((width as number) + (height as number) - 2 * rx);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="relative">
          {data.status === "running" && width && height && (
            <svg
              className="absolute z-20 pointer-events-none rounded-lg"
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
            >
              {/* Static background border */}
              <rect
                x={strokeWidth / 2}
                y={strokeWidth / 2}
                width={width - strokeWidth}
                height={height - strokeWidth}
                rx={rx}
                fill="none"
                stroke="#bfdbfe"
                strokeWidth={strokeWidth}
              />
              {/* Animated progress border */}
              <rect
                x={strokeWidth / 2}
                y={strokeWidth / 2}
                width={width - strokeWidth}
                height={height - strokeWidth}
                rx={rx}
                fill="none"
                stroke="#60a5fa"
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${gapLength}`}
                strokeDashoffset="0"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values={`${perimeter};0`}
                  dur="2.7s"
                  repeatCount="indefinite"
                />
              </rect>
            </svg>
          )}
          <div className="group relative bg-background border rounded-lg !shadow-md hover:!shadow-lg !transition-shadow w-48">
            <div className="p-3">
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center h-6 w-6 rounded-md mr-2",
                    type === "action"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-amber-100 text-amber-600",
                  )}
                >
                  {getIcon()}
                </div>
                <div className="font-medium text-sm">
                  {data.label as string}
                </div>
                <StatusIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    statusVariants[data.status as keyof typeof statusVariants]
                      .color,
                    data.status === "running" && "animate-spin-slow",
                  )}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {data.description as string}
              </div>
            </div>
            <div className="px-3 py-2 border-t border-border bg-muted/40 rounded-b-md">
              <div className="flex justify-between items-center">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium px-2.5 py-0.5 rounded-full",
                    type === "action"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-amber-100 text-amber-800",
                  )}
                >
                  {type === "action" ? "Action" : "Trigger"}
                </Badge>
                <Button
                  variant="outline"
                  className={cn(
                    "text-xs font-medium text-gray-500 px-2.5 py-0.5",
                    "h-auto rounded-full transition-colors",
                    "!hover:text-gray-700 !hover:bg-gray-50",
                  )}
                >
                  Configure
                </Button>
              </div>
            </div>
            <Handle
              type={type === "action" ? "target" : "source"}
              position={type === "action" ? Position.Top : Position.Bottom}
              className={cn(
                "!w-3 !h-3 !bg-white !border-1 !rounded-full !cursor-pointer transition-colors",
                type === "action"
                  ? "!border-purple-500 hover:!bg-purple-500 opacity-80"
                  : "!border-amber-500 hover:!bg-amber-500 opacity-80",
                (data.status === "running" || selected) && "invisible",
              )}
            />
            <Handle
              type="source"
              position={Position.Bottom}
              className={cn(
                "!w-3 !h-3 !bg-white !border-1 !rounded-full !cursor-pointer transition-colors",
                type === "action"
                  ? "!border-purple-500 hover:!bg-purple-500 opacity-80"
                  : "!border-amber-500 hover:!bg-amber-500 opacity-80",
                (data.status === "running" || selected) && "invisible",
              )}
            />
            <div
              className={cn(
                "absolute inset-0 border-1 border-blue-400 rounded-md opacity-0 pointer-events-none",
                selected ? "opacity-100" : "",
              )}
            />
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem inset>
          Logs
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset>
          Edit
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset disabled>
          Delete
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
