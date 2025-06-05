import { useFormContext } from "react-hook-form";
import { CalendarFormValues } from "./utils/calendarValidation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, MapPinIcon, BellIcon } from "lucide-react";

export function CalendarPreview() {
  const { watch } = useFormContext<CalendarFormValues>();
  const values = watch();

  if (!values.startDate?.dateTime && !values.startDate?.date) {
    return null;
  }

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
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {values.summary && (
          <div className="text-lg font-semibold">{values.summary}</div>
        )}

        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <div>
            <div>
              {formatDateTime(values.startDate.dateTime, values.startDate.date)}
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
      </CardContent>
    </Card>
  );
}
