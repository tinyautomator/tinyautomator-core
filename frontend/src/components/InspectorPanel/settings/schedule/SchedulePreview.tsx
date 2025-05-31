import { useFormContext } from "react-hook-form";
import { Calendar, Repeat, AlertCircle, Eye } from "lucide-react";
import { type ScheduleFormValues } from "./scheduleValidation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { getNextRuns, getScheduleDescription } from "./utils";

export function SchedulePreviewModal() {
  const form = useFormContext<ScheduleFormValues>();
  const values = form.watch();
  const { scheduleType, scheduledDate, scheduledTime } = values;
  const nextRuns = getNextRuns(scheduleType, scheduledDate, scheduledTime);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 w-24">
          <Eye className="h-4 w-4" />
          Preview
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
              {getScheduleDescription(
                scheduleType,
                scheduledDate,
                scheduledTime,
              )}
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Next Runs
            </div>
            <div className="space-y-1">
              {nextRuns.length > 0 ? (
                nextRuns.map((date, index) => (
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
