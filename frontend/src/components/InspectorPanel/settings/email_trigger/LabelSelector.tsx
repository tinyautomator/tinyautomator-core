"use client";

import { useEffect, useState, useMemo } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormItem, FormMessage } from "@/components/ui/form";
import { gmailApi } from "@/api";
import type { Label } from "@/api/gmail/types";
import type { FieldValues } from "react-hook-form";

interface LabelListProps {
  field: FieldValues;
}

export default function LabelSelector({ field }: LabelListProps) {
  const [labels, setLabels] = useState<Label[]>();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && labels === undefined) {
      gmailApi.getLabelList().then((data) => {
        console.log("data", data);
        setLabels(data.labels);
      });
    }
  }, [isOpen, labels]);

  // Map selected IDs to label objects for display
  const selectedLabels = useMemo(
    () =>
      (labels ?? []).filter((label) => (field.value || []).includes(label.id)),
    [labels, field.value],
  );

  const handleToggleLabel = (labelId: string) => {
    const current = field.value || [];
    if (current.includes(labelId)) {
      field.onChange(current.filter((id: string) => id !== labelId));
    } else {
      field.onChange([...current, labelId]);
    }
  };

  const handleRemoveLabel = (labelId: string) => {
    field.onChange((field.value || []).filter((id: string) => id !== labelId));
  };

  const handleClearAll = () => {
    field.onChange([]);
  };

  return (
    <FormItem>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full min-h-10 h-auto bg-transparent overflow-x-hidden"
          >
            <div className="flex flex-wrap gap-1 flex-1">
              <div className="whitespace-nowrap w-full">
                {selectedLabels.length === 0 ? (
                  <span></span>
                ) : (
                  selectedLabels.map((label) => (
                    <Badge
                      key={label.id}
                      variant="secondary"
                      className="text-xs  mr-1"
                    >
                      {label.name}
                      <span
                        role="button"
                        tabIndex={0}
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRemoveLabel(label.id);
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={() => handleRemoveLabel(label.id)}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </span>
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="flex items-center justify-between p-2 border-b">
            <span className="text-sm font-medium">Select Labels</span>
            {selectedLabels.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
          <ScrollArea className="max-h-60 overflow-x-auto">
            <div className="p-1">
              {(labels ?? []).map((label) => {
                const isSelected = (field.value || []).includes(label.id);
                return (
                  <div
                    key={label.id}
                    className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    onClick={() => handleToggleLabel(label.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleLabel(label.id)}
                      className="pointer-events-none"
                    />
                    <span className="font-medium capitalize">{label.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {label.id}
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}
