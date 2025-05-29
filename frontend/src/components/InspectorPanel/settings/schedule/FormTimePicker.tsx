import { useState, useEffect, useMemo, useCallback } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  format as dfFormat,
  parse as dfParse,
  isValid as dfIsValid,
  addMinutes as dfAddMinutes,
  isBefore as dfIsBefore,
  set as dfSet,
  getHours as dfGetHours,
  getMinutes as dfGetMinutes,
  startOfDay as dfStartOfDay,
  isSameDay as dfIsSameDay,
} from "date-fns";
import { ScheduleFormValues } from "./utils/scheduleValidation";
import { useFormContext, useWatch } from "react-hook-form";

interface TimeParts {
  hour: string;
  minute: string;
  period: string;
}

const calculateInitialTimeParts = (
  timeString24: string | undefined,
  dateContextStr?: string,
): TimeParts => {
  let initialDateToProcess: Date;
  const systemNow = new Date();
  const systemTodayStart = dfStartOfDay(systemNow);

  let contextDateIsToday = true;
  if (dateContextStr) {
    const parsedContextDate = dfParse(dateContextStr, "yyyy-MM-dd", systemNow);
    if (dfIsValid(parsedContextDate)) {
      contextDateIsToday = dfIsSameDay(
        dfStartOfDay(parsedContextDate),
        systemTodayStart,
      );
    }
  }

  if (timeString24) {
    const parsedTimeInput = dfParse(timeString24, "HH:mm", new Date());
    if (dfIsValid(parsedTimeInput)) {
      initialDateToProcess = parsedTimeInput;
    } else {
      initialDateToProcess = dfSet(new Date(), { hours: 0, minutes: 0 });
    }
  } else {
    if (contextDateIsToday) {
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
  if (currentHour12 === 0) currentHour12 = 12;

  return {
    hour: currentHour12.toString().padStart(2, "0"),
    minute: (Math.floor(m / 15) * 15).toString().padStart(2, "0"),
    period: currentPeriod,
  };
};

const checkTimeSlotDisabled = (
  h12Str: string,
  mStr: string,
  pStr: string,
  selectedDateString?: string,
): boolean => {
  const systemNow = new Date();
  const systemTodayStart = dfStartOfDay(systemNow);

  if (!selectedDateString) {
    // No date context, assume enable unless it's today and past
  } else {
    const parsedSelectedDate = dfParse(
      selectedDateString,
      "yyyy-MM-dd",
      new Date(),
    );

    if (!dfIsValid(parsedSelectedDate)) {
      return true;
    }

    const selectedDateStart = dfStartOfDay(parsedSelectedDate);

    if (dfIsBefore(selectedDateStart, systemTodayStart)) {
      return true;
    } else if (dfIsBefore(systemTodayStart, selectedDateStart)) {
      return false;
    }
  }

  const minAllowedDateTime = dfAddMinutes(systemNow, 15);
  let h24 = parseInt(h12Str, 10);
  if (pStr === "AM" && h24 === 12) h24 = 0;
  else if (pStr === "PM" && h24 < 12) h24 += 12;

  const prospectiveDateTimeOnToday = dfSet(systemTodayStart, {
    hours: h24,
    minutes: parseInt(mStr, 10),
    seconds: 0,
    milliseconds: 0,
  });

  return dfIsBefore(prospectiveDateTimeOnToday, minAllowedDateTime);
};
interface CustomTimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0"),
);
const MINUTE_OPTIONS = ["00", "15", "30", "45"];
const PERIOD_OPTIONS = ["AM", "PM"];

export function CustomTimePicker({ value, onChange }: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <Popover
      open={isOpen}
      onOpenChange={(openState) => {
        setIsOpen(openState);
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
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <Label className="block text-sm font-medium text-center text-muted-foreground">
              Hour
            </Label>
            <div className="bg-background border border-border rounded-md max-h-[15vh] overflow-y-auto py-1">
              {HOUR_OPTIONS.map((hour) => {
                const isDisabled = isTimeSlotDisabledCallback(
                  hour,
                  internalMinute,
                  internalPeriod,
                );
                return (
                  <Button
                    key={hour}
                    variant="ghost"
                    className={`w-full justify-center h-auto py-1.5 text-sm rounded-sm mx-auto block
                      ${isDisabled ? "text-muted-foreground opacity-50 pointer-events-none" : "hover:bg-accent hover:text-accent-foreground"}
                      ${hour === internalHour && !isDisabled ? "bg-accent text-accent-foreground font-semibold" : ""}`}
                    onClick={() => !isDisabled && setInternalHour(hour)}
                  >
                    {hour}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center">
            <span className="text-xl font-semibold text-muted-foreground">
              :
            </span>
          </div>

          <div className="flex-1 space-y-1">
            <Label className="block text-sm font-medium text-center text-muted-foreground">
              Minute
            </Label>
            <div className="bg-background border border-border rounded-md max-h-[15vh] overflow-y-auto py-1">
              {MINUTE_OPTIONS.map((minute) => {
                const isDisabled = isTimeSlotDisabledCallback(
                  internalHour,
                  minute,
                  internalPeriod,
                );
                return (
                  <Button
                    key={minute}
                    variant="ghost"
                    className={`w-full justify-center h-auto py-1.5 text-sm rounded-sm mx-auto block
                      ${isDisabled ? "text-muted-foreground opacity-50 pointer-events-none" : "hover:bg-accent hover:text-accent-foreground"}
                      ${minute === internalMinute && !isDisabled ? "bg-accent text-accent-foreground font-semibold" : ""}`}
                    onClick={() => !isDisabled && setInternalMinute(minute)}
                  >
                    {minute}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <Label className="block text-sm font-medium text-center text-muted-foreground">
              Period
            </Label>
            <div className="bg-background border border-border rounded-md max-h-[15vh] overflow-y-auto py-1">
              {PERIOD_OPTIONS.map((period) => {
                const isDisabled = isTimeSlotDisabledCallback(
                  internalHour,
                  internalMinute,
                  period,
                );
                return (
                  <Button
                    key={period}
                    variant="ghost"
                    className={`w-full justify-center h-auto py-1.5 text-sm rounded-sm mx-auto block
                      ${isDisabled ? "text-muted-foreground opacity-50 pointer-events-none" : "hover:bg-accent hover:text-accent-foreground"}
                      ${period === internalPeriod && !isDisabled ? "bg-accent text-accent-foreground font-semibold" : ""}`}
                    onClick={() => !isDisabled && setInternalPeriod(period)}
                  >
                    {period}
                  </Button>
                );
              })}
            </div>
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
