import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
    const date = new Date(value.dateTime);
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    onChange({
      dateTime: format(date, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    });
  };

  const displayValue = value.dateTime
    ? format(new Date(value.dateTime), "PPP p")
    : value.date
      ? format(new Date(value.date), "PPP")
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
                date: format(new Date(value.dateTime), "yyyy-MM-dd"),
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
                ? new Date(value.dateTime)
                : value.date
                  ? new Date(value.date)
                  : undefined
            }
            onSelect={handleDateSelect}
            initialFocus
          />
          {!isAllDay && value.dateTime && (
            <div className="p-3 border-t">
              <input
                type="time"
                className="w-full p-2 border rounded"
                value={format(new Date(value.dateTime), "HH:mm")}
                onChange={(e) => handleTimeChange(e.target.value)}
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
