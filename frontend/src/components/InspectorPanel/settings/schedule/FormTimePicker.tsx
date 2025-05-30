import { useState, useMemo, useCallback } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import {
  format as dfFormat,
  parse as dfParse,
  isValid as dfIsValid,
  addMinutes as dfAddMinutes,
  setMinutes as dfSetMinutes,
  setHours as dfSetHours,
  isBefore as dfIsBefore,
  isSameDay as dfIsSameDay,
} from "date-fns";
import { useFormContext, useWatch } from "react-hook-form";
import { ScheduleFormValues } from "./utils/scheduleValidation";

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0"),
);
const MINUTE_OPTIONS = ["00", "10", "20", "30", "40", "50"];
const PERIOD_OPTIONS = ["AM", "PM"];

const MINUTE_OFFSET = 10;

function dateTo12HourParts(date: Date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const period = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return {
    hour: hour12.toString().padStart(2, "0"),
    minute: m.toString().padStart(2, "0"),
    period,
  };
}

function getTimePartsFromValue(value: string) {
  if (!value) {
    const now = dfAddMinutes(new Date(), MINUTE_OFFSET);
    const m = now.getMinutes();
    const minuteOption =
      MINUTE_OPTIONS.find((opt) => parseInt(opt) >= m) || MINUTE_OPTIONS[0];
    let rounded = dfSetMinutes(now, parseInt(minuteOption));
    if (parseInt(minuteOption) < m) {
      rounded = dfSetHours(rounded, rounded.getHours() + 1);
    }
    const parts = dateTo12HourParts(rounded);
    return {
      hour: parts.hour,
      minute: minuteOption,
      period: parts.period,
    };
  }
  const parsed = dfParse(value, "HH:mm", new Date());
  if (!dfIsValid(parsed)) {
    const now = dfAddMinutes(new Date(), MINUTE_OFFSET);
    const m = now.getMinutes();
    const minuteOption =
      MINUTE_OPTIONS.find((opt) => parseInt(opt) >= m) || MINUTE_OPTIONS[0];
    let rounded = dfSetMinutes(now, parseInt(minuteOption));
    if (parseInt(minuteOption) < m) {
      rounded = dfSetHours(rounded, rounded.getHours() + 1);
    }
    const parts = dateTo12HourParts(rounded);
    return {
      hour: parts.hour,
      minute: minuteOption,
      period: parts.period,
    };
  }
  const parts = dateTo12HourParts(parsed);
  return parts;
}

function getDateFromField(dateField: unknown): Date | undefined {
  if (!dateField) return undefined;
  if (dateField instanceof Date) return dateField;
  if (typeof dateField === "string" || typeof dateField === "number") {
    const d = new Date(dateField);
    return isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

function isDateToday(date: Date | undefined) {
  if (!date) return false;
  return dfIsSameDay(date, new Date());
}

function isTimeBeforeMinOffsetToday(h: string, m: string, p: string) {
  const now = new Date();
  const minAllowed = dfAddMinutes(now, MINUTE_OFFSET);
  let hourNum = parseInt(h, 10);
  if (p === "AM" && hourNum === 12) hourNum = 0;
  if (p === "PM" && hourNum < 12) hourNum += 12;
  const candidate = dfSetMinutes(
    dfSetHours(new Date(), hourNum),
    parseInt(m, 10),
  );
  candidate.setSeconds(0, 0);
  return dfIsBefore(candidate, minAllowed);
}

export function CustomTimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { control } = useFormContext<ScheduleFormValues>();
  const dateField = useWatch({ control, name: "scheduledDate" });

  const selectedDate = useMemo(() => getDateFromField(dateField), [dateField]);
  const todaySelected = isDateToday(selectedDate);

  const { hour, minute, period } = useMemo(
    () => getTimePartsFromValue(value),
    [value],
  );

  const handleTimePartChange = useCallback(
    (field: "hour" | "minute" | "period", value: string) => {
      const h = field === "hour" ? value : hour;
      const m = field === "minute" ? value : minute;
      const p = field === "period" ? value : period;
      const hNum = parseInt(h, 10);
      const h24 =
        p === "PM" && hNum < 12
          ? hNum + 12
          : p === "AM" && hNum === 12
            ? 0
            : hNum;
      onChange(`${h24.toString().padStart(2, "0")}:${m}`);
    },
    [hour, minute, period, onChange],
  );

  const handleDone = useCallback(() => {
    setIsOpen(false);
  }, []);

  const formatDisplayTime = useCallback(() => {
    if (!value) return "Select time";
    const parsedDate = dfParse(value, "HH:mm", new Date());
    return dfIsValid(parsedDate)
      ? dfFormat(parsedDate, "hh:mm a")
      : "Select time";
  }, [value]);

  const TIME_PARTS = [
    {
      label: "Hour",
      value: hour,
      options: HOUR_OPTIONS,
      field: "hour" as const,
      disabled: (opt: string) =>
        todaySelected && isTimeBeforeMinOffsetToday(opt, minute, period),
    },
    {
      label: "Minute",
      value: minute,
      options: MINUTE_OPTIONS,
      field: "minute" as const,
      disabled: (opt: string) =>
        todaySelected && isTimeBeforeMinOffsetToday(hour, opt, period),
    },
    {
      label: "Period",
      value: period,
      options: PERIOD_OPTIONS,
      field: "period" as const,
      disabled: (opt: string) =>
        todaySelected && isTimeBeforeMinOffsetToday(hour, minute, opt),
    },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-start gap-2 text-left font-normal min-h-[2.5rem] px-3"
          aria-label={`Selected time: ${value ? formatDisplayTime() : "Select time"}. Click to change.`}
        >
          <Clock className="h-4 w-4 opacity-50 flex-shrink-0" />
          {formatDisplayTime()}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-3 space-y-3 select-none"
        align="start"
      >
        <div className="flex gap-2 items-end">
          {TIME_PARTS.map(({ label, value, options, field, disabled }) => (
            <div className="flex-1" key={field}>
              <Label className="block text-sm font-medium text-center text-muted-foreground mb-1">
                {label}
              </Label>
              <Select
                value={value}
                onValueChange={(v) => handleTimePartChange(field, v)}
              >
                <SelectTrigger className="min-w-[3.5rem] max-w-[4.5rem] px-2">
                  <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent
                  side="top"
                  align="center"
                  className="min-w-[5.5rem] max-w-[5.5rem] p-0"
                >
                  {options.map((opt) => (
                    <SelectItem
                      key={opt}
                      value={opt}
                      disabled={disabled(opt)}
                      className="data-[state=checked]:bg-black data-[state=checked]:text-white "
                    >
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-3 border-t border-border mt-3">
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
