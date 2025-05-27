import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const parseTime = useCallback((timeString: string) => {
    if (!timeString) return { hour: "01", minute: "00", period: "AM" };

    const [hourStr, minuteStr] = timeString.split(":");
    let hour24 = Number.parseInt(hourStr, 10);
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
    let hour24 = Number.parseInt(internalHour, 10);
    if (internalPeriod === "PM" && hour24 !== 12) hour24 += 12;
    if (internalPeriod === "AM" && hour24 === 12) hour24 = 0;

    const timeString = `${hour24
      .toString()
      .padStart(2, "0")}:${internalMinute}`;
    onChange(timeString);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const formatDisplayTime = () => {
    if (!value) return placeholder;
    const { hour, minute, period } = parseTime(value);
    return `${hour}:${minute} ${period}`;
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
          <Clock className="h-4 w-4 opacity-50 flex-shrink-0" />
          {formatDisplayTime()}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        side="bottom"
        avoidCollisions={false}
        alignOffset={-20}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <LocalFormLabel htmlFor="custom-timepicker-hour">
                Hour
              </LocalFormLabel>
              <Select value={internalHour} onValueChange={setInternalHour}>
                <SelectTrigger
                  id="custom-timepicker-hour"
                  className="w-full"
                  aria-label="Hour"
                >
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent
                  side="bottom"
                  align="start"
                  avoidCollisions={false}
                  alignOffset={-30}
                >
                  {hours.map((hourVal) => (
                    <SelectItem key={`hour-${hourVal}`} value={hourVal}>
                      {hourVal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="pt-6">
              {" "}
              <span className="text-xl font-bold text-muted-foreground">:</span>
            </div>

            <div className="flex-1">
              <LocalFormLabel htmlFor="custom-timepicker-minute">
                Minute
              </LocalFormLabel>
              <Select value={internalMinute} onValueChange={setInternalMinute}>
                <SelectTrigger
                  id="custom-timepicker-minute"
                  className="w-full"
                  aria-label="Minute"
                >
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent
                  side="bottom"
                  align="start"
                  avoidCollisions={false}
                  alignOffset={-30}
                >
                  {minutes.map((minuteVal) => (
                    <SelectItem key={`minute-${minuteVal}`} value={minuteVal}>
                      {minuteVal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <LocalFormLabel htmlFor="custom-timepicker-period">
                Period
              </LocalFormLabel>
              <Select value={internalPeriod} onValueChange={setInternalPeriod}>
                <SelectTrigger
                  id="custom-timepicker-period"
                  className="w-full"
                  aria-label="Period (AM/PM)"
                >
                  <SelectValue placeholder="AM/PM" />
                </SelectTrigger>
                <SelectContent
                  side="bottom"
                  align="start"
                  avoidCollisions={false}
                  alignOffset={-30}
                >
                  {periods.map((periodVal) => (
                    <SelectItem key={`period-${periodVal}`} value={periodVal}>
                      {periodVal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
