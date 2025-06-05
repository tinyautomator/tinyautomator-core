import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, parseISO, setHours, setMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

interface DateTimePickerProps {
  value: {
    date?: string;
    dateTime?: string;
  };
  onChange: (value: { date?: string; dateTime?: string }) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [isAllDay, setIsAllDay] = useState(!value.dateTime);

  useEffect(() => {
    if (value.dateTime && isAllDay) {
      onChange({
        date: format(parseISO(value.dateTime), "yyyy-MM-dd"),
      });
    } else if (value.date && !isAllDay) {
      const now = new Date();
      const date = setMinutes(
        setHours(parseISO(value.date), now.getHours()),
        now.getMinutes(),
      );
      onChange({
        dateTime: format(date, "yyyy-MM-dd'T'HH:mm:ssXXX"),
      });
    }
  }, [isAllDay]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    if (isAllDay) {
      onChange({
        date: format(date, "yyyy-MM-dd"),
      });
    } else {
      onChange({
        dateTime: format(date, "yyyy-MM-dd'T'HH:mm:ssXXX"),
      });
    }
  };

  const handleTimeChange = (time: string) => {
    if (!value.dateTime) return;
    const [hours, minutes] = time.split(":");
    const date = setMinutes(
      setHours(parseISO(value.dateTime), parseInt(hours)),
      parseInt(minutes),
    );
    onChange({
      dateTime: format(date, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    });
  };

  const displayValue = value.dateTime
    ? format(parseISO(value.dateTime), "PPP p")
    : value.date
      ? format(parseISO(value.date), "PPP")
      : "";

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Switch
          checked={!isAllDay}
          onCheckedChange={(checked) => {
            setIsAllDay(!checked);
            if (value.dateTime) {
              onChange({
                date: format(parseISO(value.dateTime), "yyyy-MM-dd"),
              });
            }
          }}
        />
        <span className="text-sm text-muted-foreground">
          {isAllDay ? "All day" : "Specific time"}
        </span>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
            onClick={() => {
              if (!value.date && !value.dateTime) {
                const today = new Date();
                if (isAllDay) {
                  onChange({
                    date: format(today, "yyyy-MM-dd"),
                  });
                } else {
                  onChange({
                    dateTime: format(today, "yyyy-MM-dd'T'HH:mm:ssXXX"),
                  });
                }
              }
            }}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue || "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={
              value.dateTime
                ? parseISO(value.dateTime)
                : value.date
                  ? parseISO(value.date)
                  : undefined
            }
            onSelect={handleDateSelect}
            initialFocus
          />
          {!isAllDay && value.dateTime && (
            <div className="p-3 border-t">
              <input
                type="time"
                className={cn(
                  "w-full p-2 border rounded",
                  "bg-background text-foreground border-input",
                  "[&::-webkit-calendar-picker-indicator]:opacity-50",
                  "[&::-webkit-calendar-picker-indicator]:hover:opacity-100",
                  "dark:[&::-webkit-calendar-picker-indicator]:invert",
                )}
                value={format(parseISO(value.dateTime), "HH:mm")}
                onChange={(e) => handleTimeChange(e.target.value)}
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
