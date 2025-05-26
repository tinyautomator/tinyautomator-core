import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CustomTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CustomTimePicker({
  value,
  onChange,
  placeholder = "Select time",
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openField, setOpenField] = useState<
    "hour" | "minute" | "period" | null
  >(null);

  const parseTime = useCallback((timeString: string) => {
    if (!timeString) return { hour: "01", minute: "00", period: "AM" };
    const [hourStr, minuteStr] = timeString.split(":");
    let hour24 = parseInt(hourStr, 10);
    const minute = minuteStr?.padStart(2, "0") || "00";
    let period = "AM";
    if (hour24 >= 12) {
      period = "PM";
      if (hour24 > 12) hour24 -= 12;
    }
    if (hour24 === 0) hour24 = 12;
    return {
      hour: hour24.toString().padStart(2, "0"),
      minute: minute.padStart(2, "0"),
      period,
    };
  }, []);

  const initialTimeParts = useMemo(() => parseTime(value), [value, parseTime]);

  const [internalHour, setInternalHour] = useState(initialTimeParts.hour);
  const [internalMinute, setInternalMinute] = useState(initialTimeParts.minute);
  const [internalPeriod, setInternalPeriod] = useState(initialTimeParts.period);

  useEffect(() => {
    if (isOpen) {
      const { hour, minute, period } = parseTime(value);
      setInternalHour(hour);
      setInternalMinute(minute);
      setInternalPeriod(period);
      setOpenField(null); // reset dropdowns when opening
    }
  }, [value, isOpen, parseTime]);

  const hours = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")),
    [],
  );
  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")),
    [],
  );
  const periods = useMemo(() => ["AM", "PM"], []);

  const handleDone = () => {
    let hour24 = parseInt(internalHour, 10);
    if (internalPeriod === "PM" && hour24 !== 12) hour24 += 12;
    if (internalPeriod === "AM" && hour24 === 12) hour24 = 0;

    const timeString = `${hour24.toString().padStart(2, "0")}:${internalMinute}`;
    onChange(timeString);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setOpenField(null);
  };

  const formatDisplayTime = () => {
    if (!value) return placeholder;
    const { hour, minute, period } = parseTime(value);
    return `${hour}:${minute} ${period}`;
  };

  const renderDropdown = (
    field: "hour" | "minute" | "period",
    items: string[],
    value: string,
    onSelect: (val: string) => void,
    ariaLabel: string,
  ) => {
    const isFieldOpen = openField === field;

    return (
      <div className="relative w-full select-none">
        <Button
          variant="outline"
          className="w-full justify-between"
          aria-label={ariaLabel}
          onClick={() => setOpenField(isFieldOpen ? null : field)}
        >
          {value}
        </Button>

        {isFieldOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-border rounded-md shadow-sm max-h-[15vh] overflow-auto">
            <ul className="text-sm">
              {items.map((item) => (
                <li
                  key={item}
                  className={`px-3 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                    item === value ? "bg-muted" : ""
                  }`}
                  onClick={() => {
                    onSelect(item);
                    setOpenField(null);
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex items-center justify-start gap-2 text-left font-normal min-h-[2.5rem] px-3"
          aria-label={`Selected time: ${
            value ? formatDisplayTime() : placeholder
          }. Click to change.`}
        >
          <span className="truncate">{formatDisplayTime()}</span>
          <Clock className="h-4 w-4 opacity-50 flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-4 space-y-4 select-none"
        align="start"
        side="bottom"
        avoidCollisions={false}
        alignOffset={-20}
      >
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <LocalFormLabel>Hour</LocalFormLabel>
            {renderDropdown(
              "hour",
              hours,
              internalHour,
              setInternalHour,
              "Hour",
            )}
          </div>
          <div className="pt-6">
            <span className="text-xl font-bold text-muted-foreground">:</span>
          </div>
          <div className="flex-1">
            <LocalFormLabel>Minute</LocalFormLabel>
            {renderDropdown(
              "minute",
              minutes,
              internalMinute,
              setInternalMinute,
              "Minute",
            )}
          </div>
          <div className="flex-1">
            <LocalFormLabel>Period</LocalFormLabel>
            {renderDropdown(
              "period",
              periods,
              internalPeriod,
              setInternalPeriod,
              "AM/PM",
            )}
          </div>
        </div>
        <div className="flex gap-2 pt-2 border-t border-border mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button size="sm" className="flex-1" onClick={handleDone}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const LocalFormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`block text-sm font-medium text-center mb-1 text-muted-foreground ${className || ""}`}
      {...props}
    >
      {children}
    </label>
  );
});
LocalFormLabel.displayName = "LocalFormLabel";
