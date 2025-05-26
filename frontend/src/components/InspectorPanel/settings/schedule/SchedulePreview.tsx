import { useFormContext } from "react-hook-form";
import { Calendar, Repeat, AlertCircle } from "lucide-react";
import type { ScheduleFormValues } from "./utils/scheduleValidation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function SchedulePreview() {
  const form = useFormContext<ScheduleFormValues>();
  const values = form.watch();

  const getScheduleDescription = () => {
    const { scheduleType, scheduledDate, scheduledTime } = values;

    if (!scheduleType || !scheduledDate || !scheduledTime) {
      return "Complete the form to see schedule preview";
    }

    const date = new Date(`${scheduledDate}T${scheduledTime}`);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    switch (scheduleType) {
      case "once": {
        return `Run once on ${formattedDate} at ${formattedTime}`;
      }
      case "daily": {
        return `Run daily at ${formattedTime}, starting ${formattedDate}`;
      }
      case "weekly": {
        const dayName = date.toLocaleDateString([], { weekday: "long" });
        return `Run weekly on ${dayName}s at ${formattedTime}, starting ${formattedDate}`;
      }
      case "monthly": {
        const dayOfMonth = date.getDate();
        const suffix =
          dayOfMonth === 1
            ? "st"
            : dayOfMonth === 2
              ? "nd"
              : dayOfMonth === 3
                ? "rd"
                : "th";
        return `Run monthly on the ${dayOfMonth}${suffix} at ${formattedTime}, starting ${formattedDate}`;
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

    const baseDate = new Date(`${scheduledDate}T${scheduledTime}`);
    const runs = [];

    if (scheduleType === "once") {
      return [baseDate];
    }

    for (let i = 0; i < 3; i++) {
      const runDate = new Date(baseDate);

      switch (scheduleType) {
        case "daily": {
          runDate.setDate(baseDate.getDate() + i);
          break;
        }
        case "weekly": {
          runDate.setDate(baseDate.getDate() + i * 7);
          break;
        }
        case "monthly": {
          runDate.setMonth(baseDate.getMonth() + i);
          break;
        }
      }

      runs.push(runDate);
    }

    return runs;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Preview
        </CardTitle>
        <CardDescription>Review your schedule configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Repeat className="h-4 w-4" />
            Schedule Description
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
                  {date.toLocaleDateString()} at{" "}
                  {date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
      </CardContent>
    </Card>
  );
}
