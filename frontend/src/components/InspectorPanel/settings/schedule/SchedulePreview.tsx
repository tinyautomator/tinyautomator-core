import { useFormContext } from "react-hook-form";
import { Calendar, AlertCircle } from "lucide-react";
import type { ScheduleFormValues } from "./utils/scheduleValidation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export function SchedulePreview() {
  const form = useFormContext<ScheduleFormValues>();
  const values = form.watch();

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
        <CardDescription>Review your schedule configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
