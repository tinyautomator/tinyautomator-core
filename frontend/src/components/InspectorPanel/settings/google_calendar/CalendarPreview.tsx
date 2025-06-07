import { useFormContext } from "react-hook-form";
import { CalendarFormValues } from "./utils/calendarValidation";
import { format, addDays, addMinutes } from "date-fns";
import { CalendarIcon, MapPinIcon, BellIcon, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function CalendarPreview() {
  const { watch } = useFormContext<CalendarFormValues>();
  const values = watch();

  const calculateEventTimes = () => {
    const now = new Date();
    let startDate = new Date(now);
    let endDate: Date | null = null;

    // Add days if specified
    if (values.eventSchedule?.start.days) {
      startDate = addDays(now, values.eventSchedule.start.days);
    }

    // Set the time if specified
    if (values.eventSchedule?.start.time) {
      console.log(values.eventSchedule.start.time);
      const [hours, minutes] = values.eventSchedule.start.time
        .split(":")
        .map(Number);
      console.log(hours, minutes);
      startDate.setHours(hours, minutes, 0, 0);
    }

    // Calculate end time if not an all-day event
    if (
      values.eventSchedule?.duration &&
      values.eventSchedule.duration.isAllDay === false &&
      typeof values.eventSchedule.duration.minutes === "number"
    ) {
      endDate = addMinutes(startDate, values.eventSchedule.duration.minutes);
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = calculateEventTimes();

  const formatDateTime = (date: Date) => {
    if (values.eventSchedule?.duration.isAllDay) {
      return format(date, "PPP");
    }
    return format(date, "PPP p");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-6">
          <Eye className="h-3.5 w-3.5 mr-1" />
          Preview Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        <div className="bg-background">
          <DialogHeader className="px-6 pt-5 pb-2 border-b">
            <DialogTitle className="text-lg font-bold">
              Calendar Event Preview
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This is a preview of the calendar event that will be created the
              next time the flow is run.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4 space-y-3">
            {values.summary && (
              <div className="text-base font-semibold">{values.summary}</div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium">{formatDateTime(startDate)}</div>
                {endDate && (
                  <div className="text-xs text-muted-foreground">
                    until {formatDateTime(endDate)}
                  </div>
                )}
              </div>
            </div>
            {values.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                <span>{values.location}</span>
              </div>
            )}
            {values.reminders && (
              <div className="flex items-center gap-2 text-sm">
                <BellIcon className="h-4 w-4 text-muted-foreground" />
                <span>Default reminders enabled</span>
              </div>
            )}
            {values.description && (
              <div className="text-xs text-muted-foreground border-t pt-3">
                {values.description}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
