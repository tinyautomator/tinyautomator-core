import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DropdownField } from "./CustomTimePicker"; // Assuming DropdownField remains or is moved appropriately

export interface TimeDropdownProps {
  field: DropdownField;
  items: string[];
  currentSelectedValue: string;
  onItemSelect: (value: string) => void;
  ariaLabel: string;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  openField: DropdownField | null;
  setOpenField: (field: DropdownField | null) => void;
  isTimeSlotDisabled: (h12Str: string, mStr: string, pStr: string) => boolean;
  internalHour: string;
  internalMinute: string;
  internalPeriod: string;
}

export const TimeDropdown: React.FC<TimeDropdownProps> = ({
  field,
  items,
  currentSelectedValue,
  onItemSelect,
  ariaLabel,
  dropdownRef,
  openField,
  setOpenField,
  isTimeSlotDisabled,
  internalHour,
  internalMinute,
  internalPeriod,
}) => {
  const isThisDropdownOpen = openField === field;
  return (
    <div className="relative w-full select-none" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between min-h-[2.25rem] px-2.5 py-1.5 text-sm rounded-md hover:bg-accent data-[state=open]:bg-accent"
        data-state={isThisDropdownOpen ? "open" : "closed"}
        onClick={() => setOpenField(isThisDropdownOpen ? null : field)}
        aria-expanded={isThisDropdownOpen}
        aria-label={ariaLabel}
      >
        {currentSelectedValue}
        <ChevronDown
          className={`ml-1 h-4 w-4 opacity-70 transition-transform duration-200 ${isThisDropdownOpen ? "rotate-180" : ""}`}
        />
      </Button>
      {isThisDropdownOpen && (
        <div className="absolute z-20 mt-1 w-full bg-popover border border-border rounded-md shadow-lg max-h-[15vh] overflow-y-auto">
          <ul className="text-sm py-1">
            {items.map((item) => {
              const isDisabled =
                field === "hour"
                  ? isTimeSlotDisabled(item, internalMinute, internalPeriod)
                  : field === "minute"
                    ? isTimeSlotDisabled(internalHour, item, internalPeriod)
                    : isTimeSlotDisabled(internalHour, internalMinute, item);
              return (
                <li
                  key={item}
                  className={`px-3 py-1.5 text-center cursor-pointer rounded-sm mx-1
                                ${isDisabled ? "text-muted-foreground opacity-50 pointer-events-none" : "hover:bg-accent hover:text-accent-foreground"}
                                ${item === currentSelectedValue && !isDisabled ? "bg-accent text-accent-foreground font-semibold" : ""}`}
                  onClick={() => {
                    if (!isDisabled) {
                      onItemSelect(item);
                      setOpenField(null);
                    }
                  }}
                >
                  {item}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
