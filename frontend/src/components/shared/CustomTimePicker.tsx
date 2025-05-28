// frontend/src/components/shared/CustomTimePicker.tsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  format as dfFormat,
  parse as dfParse,
  addMinutes as dfAddMinutes,
  isBefore as dfIsBefore,
  set as dfSet,
  getHours as dfGetHours,
  getMinutes as dfGetMinutes,
  startOfDay as dfStartOfDay,
  isValid as dfIsValid,
  isSameDay as dfIsSameDay,
} from "date-fns";

interface CustomTimePickerProps {
  value: string; // Expected format: HH:mm (24-hour)
  onChange: (value: string) => void; // Output format: HH:mm (24-hour)
  placeholder?: string;
  selectedDate?: string; // Added prop: YYYY-MM-DD string from date picker
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

export function CustomTimePicker({
  value,
  onChange,
  placeholder = "Select time",
  selectedDate: selectedDateString, // Renamed for clarity within the component
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openField, setOpenField] = useState<
    "hour" | "minute" | "period" | null
  >(null);

  const hourDropdownRef = useRef<HTMLDivElement>(null);
  const minuteDropdownRef = useRef<HTMLDivElement>(null);
  const periodDropdownRef = useRef<HTMLDivElement>(null);

  const parseValueToInternalState = useCallback(
    (timeString24: string | undefined, dateContextStr?: string) => {
      let initialDateToProcess: Date;
      const systemNow = new Date();
      const systemTodayStart = dfStartOfDay(systemNow);

      // Determine the date context for defaulting time
      let contextDateIsToday = true; // Assume today if no dateContextStr
      if (dateContextStr) {
        const parsedContextDate = dfParse(
          dateContextStr,
          "yyyy-MM-dd",
          systemNow,
        );
        if (dfIsValid(parsedContextDate)) {
          contextDateIsToday = dfIsSameDay(
            dfStartOfDay(parsedContextDate),
            systemTodayStart,
          );
        }
        // If dateContextStr is invalid, contextDateIsToday remains true (treat as today)
      }

      if (timeString24) {
        const parsedTimeInput = dfParse(timeString24, "HH:mm", new Date());
        if (dfIsValid(parsedTimeInput)) {
          initialDateToProcess = parsedTimeInput; // Use time from input
        } else {
          // Fallback for invalid timeString24: default to 12:00 AM for clarity
          initialDateToProcess = dfSet(new Date(), { hours: 0, minutes: 0 });
        }
      } else {
        // No time value provided, set a smart default
        if (contextDateIsToday) {
          // Context is today: find next available 15-min slot from now
          let tempDate = dfAddMinutes(systemNow, 15);
          const currentMinute = dfGetMinutes(tempDate);
          tempDate = dfSet(tempDate, {
            minutes: Math.ceil(currentMinute / 15) * 15,
            seconds: 0,
            milliseconds: 0,
          });

          const minAllowedFromNow = dfAddMinutes(systemNow, 15);
          if (dfIsBefore(tempDate, minAllowedFromNow)) {
            tempDate = dfSet(minAllowedFromNow, {
              minutes: Math.ceil(dfGetMinutes(minAllowedFromNow) / 15) * 15,
              seconds: 0,
              milliseconds: 0,
            });
            if (dfIsBefore(tempDate, minAllowedFromNow)) {
              tempDate = dfAddMinutes(tempDate, 15);
            }
          }
          initialDateToProcess = tempDate;
        } else {
          // Context is a future date: default to a common time like 09:00 AM
          initialDateToProcess = dfSet(new Date(), {
            hours: 9,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
          });
        }
      }

      const h24 = dfGetHours(initialDateToProcess);
      const m = dfGetMinutes(initialDateToProcess);
      const currentPeriod = h24 >= 12 ? "PM" : "AM";
      let currentHour12 = h24 % 12;
      if (currentHour12 === 0) currentHour12 = 12; // 0 or 12 for 24h format becomes 12 for 12h format

      return {
        hour: currentHour12.toString().padStart(2, "0"),
        minute: (Math.floor(m / 15) * 15).toString().padStart(2, "0"), // Ensure minute is snapped
        period: currentPeriod,
      };
    },
    [], // No dependencies, as context is passed as argument
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
      const newParts = parseValueToInternalState(value, selectedDateString);
      setInternalHour(newParts.hour);
      setInternalMinute(newParts.minute);
      setInternalPeriod(newParts.period);
      setOpenField(null);
    }
  }, [value, isOpen, parseValueToInternalState, selectedDateString]);

  const hourOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")),
    [],
  );
  const minuteOptions = useMemo(() => ["00", "15", "30", "45"], []);
  const periodOptions = useMemo(() => ["AM", "PM"], []);

  const isTimeSlotDisabled = useCallback(
    (h12Str: string, mStr: string, pStr: string): boolean => {
      const systemTodayStart = dfStartOfDay(new Date()); // Today for comparison

      let applyRestrictionRule = false;
      if (!selectedDateString || selectedDateString === "") {
        // No date selected from date picker (e.g., form field is empty), assume "today" for restriction
        applyRestrictionRule = true;
      } else {
        const parsedSelectedDate = dfParse(
          selectedDateString,
          "yyyy-MM-dd",
          new Date(),
        );
        if (
          dfIsValid(parsedSelectedDate) &&
          dfIsSameDay(dfStartOfDay(parsedSelectedDate), systemTodayStart)
        ) {
          // Date selected is today
          applyRestrictionRule = true;
        } else if (
          dfIsValid(parsedSelectedDate) &&
          dfIsBefore(systemTodayStart, dfStartOfDay(parsedSelectedDate))
        ) {
          // Date selected is in the future
          applyRestrictionRule = false;
        } else {
          // Date selected is invalid or in the past (though date picker should prevent past dates)
          // If invalid, arguably should restrict as if today or simply not disable. Let's default to restricting.
          applyRestrictionRule = true;
        }
      }

      if (!applyRestrictionRule) {
        return false; // No restriction for future dates
      }

      // Apply the 15-minute rule because the context implies "today"
      const minAllowedDateTime = dfAddMinutes(new Date(), 15); // "Now" + 15 min
      let h24 = parseInt(h12Str, 10);
      if (pStr === "AM" && h24 === 12)
        h24 = 0; // 12 AM is 00 hours
      else if (pStr === "PM" && h24 < 12) h24 += 12; // 1 PM to 11 PM

      // Construct the prospective time using system's "today" to compare against minAllowedDateTime
      const prospectiveDateTimeOnToday = dfSet(systemTodayStart, {
        hours: h24,
        minutes: parseInt(mStr, 10),
      });

      return dfIsBefore(prospectiveDateTimeOnToday, minAllowedDateTime);
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
      const targetIsOutside = (ref: React.RefObject<HTMLDivElement | null>) =>
        ref.current && !ref.current.contains(event.target as Node);

      if (openField === "hour" && targetIsOutside(hourDropdownRef))
        setOpenField(null);
      else if (openField === "minute" && targetIsOutside(minuteDropdownRef))
        setOpenField(null);
      else if (openField === "period" && targetIsOutside(periodDropdownRef))
        setOpenField(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openField]);

  const renderTimeDropdown = (
    field: "hour" | "minute" | "period",
    items: string[],
    currentSelectedValue: string,
    onItemSelect: (value: string) => void,
    ariaLabel: string,
    dropdownRef: React.RefObject<HTMLDivElement | null>,
  ) => {
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
          <div className="flex-1">
            <LocalFormLabel>Hour</LocalFormLabel>
            {renderTimeDropdown(
              "hour",
              hourOptions,
              internalHour,
              setInternalHour,
              "Select Hour",
              hourDropdownRef,
            )}
          </div>
          <div className="pb-1.5">
            <span className="text-xl font-semibold text-muted-foreground">
              :
            </span>
          </div>
          <div className="flex-1">
            <LocalFormLabel>Minute</LocalFormLabel>
            {renderTimeDropdown(
              "minute",
              minuteOptions,
              internalMinute,
              setInternalMinute,
              "Select Minute",
              minuteDropdownRef,
            )}
          </div>
          <div className="flex-1">
            <LocalFormLabel>Period</LocalFormLabel>
            {renderTimeDropdown(
              "period",
              periodOptions,
              internalPeriod,
              setInternalPeriod,
              "Select AM/PM",
              periodDropdownRef,
            )}
          </div>
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
