"use client";

import type React from "react";
import { useState, useCallback } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
  ChevronsDown,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Direction = "left" | "right" | "top" | "bottom";
type Size = "sm" | "md" | "lg" | "xl" | "2xl";

const collapsedWidthMap: Record<Size, string> = {
  sm: "w-56",
  md: "w-72",
  lg: "w-96",
  xl: "w-[450px]",
  "2xl": "w-[650px]",
};

const expandedWidthMap: Record<Size, string> = {
  sm: "w-72",
  md: "w-96",
  lg: "w-[450px]",
  xl: "w-[650px]",
  "2xl": "w-[900px]",
};

const collapsedHeightMap: Record<Size, string> = {
  sm: "h-56",
  md: "h-72",
  lg: "h-96",
  xl: "h-[450px]",
  "2xl": "h-[650px]",
};

const expandedHeightMap: Record<Size, string> = {
  sm: "h-72",
  md: "h-96",
  lg: "h-[450px]",
  xl: "h-[650px]",
  "2xl": "h-[900px]",
};

const buttonPositionMap: Record<Direction, string> = {
  left: "absolute right-4 top-6",
  right: "absolute left-2 top-6",
  top: "absolute bottom-2 left-1/2 -translate-x-1/2",
  bottom: "absolute top-2 left-1/2 -translate-x-1/2",
};

interface ExpandablePanelProps {
  children: React.ReactNode;
  direction?: Direction;
  size?: Size;
  defaultExpanded?: boolean;
  className?: string;
  buttonClassName?: string;
  contentClassName?: string;
  onExpandChange?: (expanded: boolean) => void;
}

export function ExpandablePanel({
  children,
  direction = "left",
  size = "xl",
  defaultExpanded = false,
  className = "",
  buttonClassName = "",
  contentClassName = "",
  onExpandChange,
}: ExpandablePanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isHorizontal = direction === "left" || direction === "right";

  const toggleExpanded = useCallback(() => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onExpandChange?.(newExpanded);
  }, [expanded, onExpandChange]);

  const dimensionClass = isHorizontal
    ? expanded
      ? expandedWidthMap[size]
      : collapsedWidthMap[size]
    : expanded
      ? expandedHeightMap[size]
      : collapsedHeightMap[size];

  const containerClasses = cn(
    "relative overflow-hidden transition-all duration-300 ease-in-out",
    dimensionClass,
    "max-w-full max-h-full",
    className,
  );

  const buttonClasses = cn(
    "flex items-center justify-center p-2 rounded-md bg-white/90 z-10",
    "shadow-sm hover:bg-gray-100 transition-all duration-200",
    "dark:bg-gray-800/90 dark:hover:bg-gray-700 dark:text-gray-200",
    buttonClassName,
  );

  return (
    <div className={containerClasses}>
      <button
        onClick={toggleExpanded}
        className={cn(buttonPositionMap[direction], buttonClasses)}
        aria-label={expanded ? "Collapse panel" : "Expand panel"}
        aria-expanded={expanded}
      >
        <IconComponent
          direction={direction}
          expanded={expanded}
          className="w-4 h-4 text-gray-500 dark:text-gray-300"
        />
      </button>

      <ScrollArea className={cn("w-full h-full", contentClassName)}>
        <div className="p-4">{children}</div>
      </ScrollArea>
    </div>
  );
}

const iconMap = {
  left: ChevronsLeft,
  right: ChevronsRight,
  top: ChevronsUp,
  bottom: ChevronsDown,
};

function IconComponent({
  direction,
  expanded,
  className,
}: {
  direction: Direction;
  expanded: boolean;
  className?: string;
}) {
  const Icon = iconMap[direction];

  return (
    <Icon
      className={cn(
        className,
        "transform transition-transform duration-300 ease-in-out origin-center",
        expanded ? "rotate-180" : "",
      )}
    />
  );
}
