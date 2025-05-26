import { useFormContext } from "react-hook-form";
import type { ScheduleFormValues } from "./utils/scheduleValidation";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomDatePicker } from "@/components/shared/CustomDatePicker";
import { useMemo } from "react";
import { CustomTimePicker } from "@/components/shared/CustomTimePicker";

export function ScheduleForm() {
  const form = useFormContext<ScheduleFormValues>();

  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  const timeZoneAbbr = useMemo(() => {
    try {
      const date = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      const parts = formatter.formatToParts(date);
      const tzPart = parts.find((part) => part.type === "timeZoneName");
      return tzPart?.value || null;
    } catch {
      return null;
    }
  }, [timeZone]);

  return (
    <Card>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="scheduleType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 gap-2 w-[200px]  rounded-md">
                    <SelectValue placeholder="Select schedule frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="once">Run Once</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduledDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <div className="flex items-center h-12 gap-2 w-[200px] rounded-md">
                  <CustomDatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select date"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduledTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">Time</FormLabel>
              <FormControl>
                <div className="flex items-center h-12 gap-2 w-[200px] rounded-md">
                  <div className="flex-1 h-full">
                    <CustomTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time"
                    />
                  </div>
                  <span className="text-muted-foreground text-sm mr-1 pb-1.75 whitespace-nowrap">
                    {timeZoneAbbr}
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
