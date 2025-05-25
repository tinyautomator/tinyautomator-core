import "@xyflow/react/dist/style.css";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader,
  LucideProps,
} from "lucide-react";
import {
  RefAttributes,
  memo,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/components/Canvas/flowStore";

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

export const NodeUI = memo(function NodeUI({
  id,
  type,
  data,
  selected,
  height,
  width,
}: NodeProps) {
  const handleAnimations = useFlowStore((state) => state.handleAnimations);
  const nodeStatus = useFlowStore((state) => state.getNodeStatus(id));
  console.log(id, nodeStatus);
  const getIcon = useMemo(
    () => () => {
      const Icon = data.icon as React.ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
      >;
      return Icon ? <Icon size={16} /> : null;
    },
    [data.icon],
  );

  const StatusIcon = nodeStatus
    ? statusVariants[nodeStatus as keyof typeof statusVariants].icon
    : statusVariants.success.icon;

  const rx = 8;
  const strokeWidth = 3;
  const dashLength =
    0.3 * (2 * ((width as number) + (height as number) - 2 * rx)); // 30% of perimeter
  const gapLength =
    0.7 * (2 * ((width as number) + (height as number) - 2 * rx)); // 70% of perimeter
  const perimeter = 2 * ((width as number) + (height as number) - 2 * rx);

  return (
    <div className="relative">
      {nodeStatus === "running" && width && height && (
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
            stroke="#d1fae5"
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
            stroke="#10b981"
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
            <div className="font-medium text-sm">{data.label as string}</div>
            <StatusIcon
              className={cn(
                "ml-auto h-4 w-4",
                statusVariants[nodeStatus as keyof typeof statusVariants].color,
                nodeStatus === "running" && "animate-spin-slow",
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
        {type === "action" && (
          <CustomHandle
            type="target"
            position={Position.Top}
            handleType="input"
            animateHandle={handleAnimations[id]?.target ?? false}
            nodeType={type}
          />
        )}
        <CustomHandle
          type="source"
          position={Position.Bottom}
          handleType="output"
          animateHandle={handleAnimations[id]?.source ?? false}
          nodeType={type}
        />
        <div
          className={cn(
            "absolute inset-0 border-1 border-blue-400 rounded-md opacity-0 pointer-events-none",
            selected ? "opacity-100" : "",
          )}
        />
      </div>
    </div>
  );
});

interface CustomHandleProps {
  type: "source" | "target";
  position: Position;
  handleType: "input" | "output";
  animateHandle: boolean | undefined;
  nodeType: string;
}

export const CustomHandle = ({
  type,
  position,
  handleType,
  animateHandle,
  nodeType,
}: CustomHandleProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);

  // Color scheme based on nodeType
  const borderColor =
    nodeType === "action"
      ? isActive
        ? "border-purple-700"
        : isHovered || animateHandle
          ? "border-purple-600"
          : "border-purple-500"
      : nodeType === "trigger"
        ? isActive
          ? "border-amber-700"
          : isHovered || animateHandle
            ? "border-amber-600"
            : "border-amber-500"
        : "border-blue-400";

  const innerBgColor =
    nodeType === "action"
      ? isActive
        ? "bg-purple-500"
        : isHovered || animateHandle
          ? "bg-purple-400"
          : "bg-purple-300"
      : nodeType === "trigger"
        ? isActive
          ? "bg-amber-500"
          : isHovered || animateHandle
            ? "bg-amber-400"
            : "bg-amber-300"
        : "bg-blue-200";

  useEffect(() => {
    const el = handleRef.current;
    if (!el) return;

    const handleMouseUp = () => {
      setIsActive(false);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseDown = () => {
      setIsActive(true);
      document.addEventListener("mouseup", handleMouseUp);
    };

    el.addEventListener("mousedown", handleMouseDown);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 z-10 transition-opacity duration-300 pointer-events-none",
        isHovered || isActive || animateHandle ? "opacity-100" : "opacity-70",
        handleType === "output" ? "top-full mt-3" : "bottom-full mb-3",
      )}
    >
      <div className="relative group/handle flex items-center justify-center pointer-events-none">
        {/* Animated connection guide */}
        <div
          className={cn(
            "absolute left-1/2 w-[2px] h-3 transition-all duration-500",
            handleType === "input" ? "top-[100%]" : "bottom-[100%]",
            isHovered || animateHandle
              ? "opacity-100 scale-y-100"
              : "opacity-0 scale-y-0",
            nodeType === "action"
              ? "bg-gradient-to-b from-purple-600 to-transparent"
              : nodeType === "trigger"
                ? "bg-gradient-to-b from-amber-500 to-transparent"
                : "bg-gradient-to-b from-blue-400 to-transparent",
          )}
        />
        {/* Main handle container */}
        <div
          className={cn(
            "relative flex items-center justify-center w-5 h-5 transition-all duration-300 ease-out pointer-events-none",
            isActive || isHovered ? "scale-110" : "scale-100",
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          ref={handleRef}
        >
          {/* React Flow Handle - Hidden but functional */}
          <Handle
            type={type}
            position={position}
            className={cn(
              "!absolute !inset-0 !w-full !h-full !m-0 !p-0",
              "!translate-x-0 !translate-y-0 !transform-none",
              "!bg-transparent !border-none !rounded-none",
              "pointer-events-auto",
            )}
            // className="!transform-none !translate-x-0 !translate-y-0 !static !border-0 !bg-transparent"
          />
          {/* Outer ring - magnetic effect */}
          <div
            className={cn(
              "absolute inset-0 rounded-full transition-all duration-300 border-1 border-dashed",
              animateHandle && "animate-handle-spin-slow",
              borderColor,
            )}
          />
          {/* Inner connection point */}
          <div
            className={cn(
              "absolute inset-1 rounded-full transition-all duration-300 transform",
              innerBgColor,
              isActive
                ? "scale-125"
                : isHovered || animateHandle
                  ? "scale-100"
                  : "scale-75",
            )}
          />
          {/* Center dot */}
          <div
            className={cn(
              "absolute inset-2 rounded-full bg-white transition-all duration-300",
              isActive || animateHandle ? "scale-0" : "scale-100",
            )}
          />
        </div>
        {/* Instructional text */}
        {!animateHandle && (
          <div
            className={cn(
              "absolute",
              handleType === "input" ? "bottom-full mb-1" : "top-full mt-1",
              "left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium transition-all duration-300",
              isHovered
                ? "opacity-100 transform translate-y-0"
                : "opacity-0 transform " +
                    (handleType === "input"
                      ? "translate-y-1"
                      : "-translate-y-1"),
            )}
          >
            <span
              className={
                nodeType === "action"
                  ? "text-purple-400"
                  : nodeType === "trigger"
                    ? "text-amber-500"
                    : "text-blue-400"
              }
            >
              {handleType === "input"
                ? "⌄ Drop connection here"
                : "⌃ Drag to connect"}
            </span>
          </div>
        )}
        {/* Ripple effect on active state */}
        {isActive && (
          <div
            className={cn(
              "absolute inset-[-8px] rounded-full animate-handle-ping-slow opacity-30",
              nodeType === "action"
                ? "bg-purple-200"
                : nodeType === "trigger"
                  ? "bg-amber-200"
                  : "bg-blue-200",
            )}
          />
        )}
      </div>
    </div>
  );
};
