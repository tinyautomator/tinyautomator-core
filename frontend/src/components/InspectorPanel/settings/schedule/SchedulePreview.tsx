import { useFormContext } from "react-hook-form";
import { Calendar, Repeat, AlertCircle, Eye } from "lucide-react";
import type { ScheduleFormValues } from "./utils/scheduleValidation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format, addDays, addWeeks, addMonths } from "date-fns";

export function SchedulePreviewModal() {
  const form = useFormContext<ScheduleFormValues>();
  const values = form.watch();

  const getScheduleDescription = () => {
    const { scheduleType, scheduledDate, scheduledTime } = values;

    if (!scheduleType || !scheduledDate || !scheduledTime) {
      return "Complete the form to see schedule preview";
    }

    const dateTimeString = `${format(scheduledDate, "yyyy-MM-dd")}T${scheduledTime}`;
    const date = new Date(dateTimeString);

    const formattedDate = format(date, "P");
    const formattedTime = format(date, "p");

    switch (scheduleType) {
      case "once": {
        return `Run once on ${formattedDate} at ${formattedTime}`;
      }
      case "daily": {
        return `Run daily at ${formattedTime}, starting ${formattedDate}`;
      }
      case "weekly": {
        const dayName = format(date, "EEEE");
        return `Run weekly on ${dayName}s at ${formattedTime}, starting ${formattedDate}`;
      }
      case "monthly": {
        const dayOfMonth = format(date, "do");
        return `Run monthly on the ${dayOfMonth} at ${formattedTime}, starting ${formattedDate}`;
      }
      default:
        return "Invalid schedule configuration";
    }
  };

  const getNextRuns = () => {
    const { scheduleType, scheduledDate, scheduledTime } = values;

    if (!scheduleType || !scheduledDate || !scheduledTime) {
      return [];
    }

    const dateTimeString = `${format(scheduledDate, "yyyy-MM-dd")}T${scheduledTime}`;
    const baseDate = new Date(dateTimeString);
    const runs: Date[] = [];

    if (scheduleType === "once") {
      return [baseDate];
    }

    for (let i = 0; i < 3; i++) {
      let runDate = baseDate;
      switch (scheduleType) {
        case "daily":
          runDate = addDays(baseDate, i);
          break;
        case "weekly":
          runDate = addWeeks(baseDate, i);
          break;
        case "monthly":
          runDate = addMonths(baseDate, i);
          break;
      }
      runs.push(runDate);
    }

    return runs;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Preview Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Review Schedule Configuration
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Repeat className="h-4 w-4" />
              Frequency
            </div>
            <p className="text-sm text-muted-foreground">
              {getScheduleDescription()}
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Next Runs
            </div>
            <div className="space-y-1">
              {getNextRuns().length > 0 ? (
                getNextRuns().map((date, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    {format(date, "P")} at {format(date, "p")}
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  Complete the form to see upcoming runs
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
