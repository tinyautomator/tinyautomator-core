import { useFormContext } from "react-hook-form";
import { CalendarFormValues } from "./utils/calendarValidation";
import { format } from "date-fns";
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

  const formatDateTime = (dateTime?: string, date?: string) => {
    if (dateTime) {
      return format(new Date(dateTime), "PPP p");
    }
    if (date) {
      return format(new Date(date), "PPP");
    }
    return "";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-6">
          <Eye className="h-3.5 w-3.5 mr-1" />
          Preview Event
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-description="Preview what your calendar event will look like"
        aria-describedby="calendar preview"
      >
        <DialogHeader>
          <DialogTitle>Calendar Event Preview</DialogTitle>
          <DialogDescription>
            This is a preview of the calendar event that will be created.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {values.summary && (
            <div className="text-lg font-semibold">{values.summary}</div>
          )}

          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <div>
              <div>
                {formatDateTime(
                  values.startDate?.dateTime,
                  values.startDate?.date,
                )}
              </div>
              {values.endDate && (
                <div>
                  to{" "}
                  {formatDateTime(values.endDate.dateTime, values.endDate.date)}
                </div>
              )}
            </div>
          </div>

          {values.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPinIcon className="mr-2 h-4 w-4" />
              {values.location}
            </div>
          )}

          {values.reminders && (
            <div className="flex items-center text-sm text-muted-foreground">
              <BellIcon className="mr-2 h-4 w-4" />
              Default reminders enabled
            </div>
          )}

          {values.description && (
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {values.description}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
