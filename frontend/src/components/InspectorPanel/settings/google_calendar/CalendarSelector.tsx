import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { googleCalendarApi, GetCalendarsResponse } from "@/api";

interface CalendarSelectorProps {
  value?: string;
  onChange: (calendarId: string) => void;
}

export function CalendarSelector({ value, onChange }: CalendarSelectorProps) {
  const [calendars, setCalendars] = useState<GetCalendarsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && !calendars && !isLoading) {
      setIsLoading(true);
      googleCalendarApi
        .getCalendars()
        .then((response) => {
          setCalendars(response);
        })
        .catch((error) => {
          console.error("Failed to fetch calendars:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, isLoading]);

  const selectedCalendar = calendars?.items?.find((c) => c.id === value);
  const displayValue =
    selectedCalendar?.summary || value || "Select a calendar";

  return (
    <Select
      value={value}
      onValueChange={onChange}
      onOpenChange={setIsOpen}
      disabled={isLoading}
    >
      <SelectTrigger className="w-full">
        <div className="flex items-center">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CalendarIcon className="mr-2 h-4 w-4" />
          )}
          <SelectValue placeholder="Select a calendar">
            {isLoading ? "Loading calendars..." : displayValue}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading calendars...
            </span>
          </div>
        ) : calendars?.items?.length ? (
          calendars.items.map((calendar) => (
            <SelectItem key={calendar.id} value={calendar.id}>
              <div className="flex flex-col">
                <div className="flex items-center">
                  {calendar.summary}
                  {calendar.primary && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Primary)
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  ID: {calendar.id}
                </span>
              </div>
            </SelectItem>
          ))
        ) : (
          <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
            No calendars found
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
