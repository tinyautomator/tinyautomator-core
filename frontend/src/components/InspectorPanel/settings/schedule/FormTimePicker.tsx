import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  format as dfFormat,
  parse as dfParse,
  isValid as dfIsValid,
} from "date-fns";
import { ScheduleFormValues } from "./utils/scheduleValidation";
import { useFormContext, useWatch } from "react-hook-form";
import {
  calculateInitialTimeParts,
  checkTimeSlotDisabled,
} from "./utils/timePickerUtils";
import { TimeDropdown } from "./TimeDropdown";

interface CustomTimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0"),
);
const MINUTE_OPTIONS = ["00", "15", "30", "45"];
const PERIOD_OPTIONS = ["AM", "PM"];

export type DropdownField = "hour" | "minute" | "period";

interface DropdownConfig {
  field: DropdownField;
  label: string;
  options: string[];
  value: string;
  setter: (value: string) => void;
  ariaLabel: string;
}

export function CustomTimePicker({ value, onChange }: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openField, setOpenField] = useState<DropdownField | null>(null);
  const placeholder = "Select time";
  const { control } = useFormContext<ScheduleFormValues>();
  const dateField = useWatch({ control, name: "scheduledDate" });

  const selectedDateString = useMemo(() => {
    if (!dateField) return undefined;
    try {
      const d = dateField instanceof Date ? dateField : new Date(dateField);
      if (dfIsValid(d)) {
        return dfFormat(d, "yyyy-MM-dd");
      }
    } catch {
      //
    }
    return undefined;
  }, [dateField]);

  const dropdownRefs = useMemo(
    () => ({
      hour: React.createRef<HTMLDivElement>(),
      minute: React.createRef<HTMLDivElement>(),
      period: React.createRef<HTMLDivElement>(),
    }),
    [],
  );

  const parseValueToInternalState = useCallback(
    (timeString24: string | undefined, dateContextStr?: string) => {
      return calculateInitialTimeParts(timeString24, dateContextStr);
    },
    [],
  );

  const initialParts = useMemo(
    () => parseValueToInternalState(value, selectedDateString),
    [value, selectedDateString, parseValueToInternalState],
  );

  const [internalHour, setInternalHour] = useState<string>(initialParts.hour);
  const [internalMinute, setInternalMinute] = useState<string>(
    initialParts.minute,
  );
  const [internalPeriod, setInternalPeriod] = useState<string>(
    initialParts.period,
  );

  useEffect(() => {
    if (isOpen) {
      const newParts = calculateInitialTimeParts(value, selectedDateString);
      setInternalHour(newParts.hour);
      setInternalMinute(newParts.minute);
      setInternalPeriod(newParts.period);
      setOpenField(null);
    }
  }, [value, isOpen, selectedDateString, parseValueToInternalState]);

  const isTimeSlotDisabledCallback = useCallback(
    (h12Str: string, mStr: string, pStr: string): boolean => {
      return checkTimeSlotDisabled(h12Str, mStr, pStr, selectedDateString);
    },
    [selectedDateString],
  );

  const handleDone = () => {
    let h24 = parseInt(internalHour, 10);
    if (internalPeriod === "AM" && h24 === 12) h24 = 0;
    else if (internalPeriod === "PM" && h24 < 12) h24 += 12;
    const outputTimeString = `${h24.toString().padStart(2, "0")}:${internalMinute}`;
    onChange(outputTimeString);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const formatDisplayTime = useCallback(() => {
    if (!value) return placeholder;
    const parsedDate = dfParse(value, "HH:mm", new Date());
    return dfIsValid(parsedDate)
      ? dfFormat(parsedDate, "hh:mm a")
      : placeholder;
  }, [value, placeholder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!openField) return;
      const activeRef = dropdownRefs[openField];
      if (
        activeRef.current &&
        !activeRef.current.contains(event.target as Node)
      ) {
        setOpenField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openField, dropdownRefs]);

  const dropdownConfigurations: DropdownConfig[] = [
    {
      field: "hour",
      label: "Hour",
      options: HOUR_OPTIONS,
      value: internalHour,
      setter: setInternalHour,
      ariaLabel: "Select Hour",
    },
    {
      field: "minute",
      label: "Minute",
      options: MINUTE_OPTIONS,
      value: internalMinute,
      setter: setInternalMinute,
      ariaLabel: "Select Minute",
    },
    {
      field: "period",
      label: "Period",
      options: PERIOD_OPTIONS,
      value: internalPeriod,
      setter: setInternalPeriod,
      ariaLabel: "Select AM/PM",
    },
  ];

  return (
    <Popover
      open={isOpen}
      onOpenChange={(openState) => {
        setIsOpen(openState);
        if (!openState) setOpenField(null);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-start gap-2 text-left font-normal min-h-[2.5rem] px-3"
          aria-label={`Selected time: ${value ? formatDisplayTime() : placeholder}. Click to change.`}
        >
          <Clock className="h-4 w-4 opacity-50 flex-shrink-0" />
          {formatDisplayTime()}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-3 space-y-3 select-none"
        align="start"
      >
        <div className="flex items-end gap-1.5">
          {dropdownConfigurations.map((config, index) => (
            <React.Fragment key={config.field}>
              <div className="flex-1">
                <LocalFormLabel>{config.label}</LocalFormLabel>
                <TimeDropdown
                  field={config.field}
                  items={config.options}
                  currentSelectedValue={config.value}
                  onItemSelect={config.setter}
                  ariaLabel={config.ariaLabel}
                  dropdownRef={dropdownRefs[config.field]}
                  openField={openField}
                  setOpenField={setOpenField}
                  isTimeSlotDisabled={isTimeSlotDisabledCallback}
                  internalHour={internalHour}
                  internalMinute={internalMinute}
                  internalPeriod={internalPeriod}
                />
              </div>
              {index < dropdownConfigurations.length - 1 && (
                <div className="pb-1.5">
                  <span className="text-xl font-semibold text-muted-foreground">
                    :
                  </span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex gap-2 pt-3 border-t border-border mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1"
            onClick={handleDone}
          >
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
