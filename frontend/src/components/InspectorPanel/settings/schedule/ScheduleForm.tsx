// frontend/src/components/ScheduleForm.tsx
import { useFormContext } from "react-hook-form";
import type { ScheduleFormValues } from "./utils/scheduleValidation"; //
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
import { ScheduleDatePickerField } from "./FormDatePicker"; //
import { useMemo } from "react";
import { CustomTimePicker } from "./FormTimePicker"; //
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTimeZoneAbbreviation } from "./utils/getTimeZone";

export function ScheduleForm() {
  const form = useFormContext<ScheduleFormValues>();

  const timeZoneAbbr = useMemo(() => getTimeZoneAbbreviation(), []);

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
                    <SelectValue placeholder="Schedule Frequency" />
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
          render={({ field }) => <ScheduleDatePickerField field={field} />}
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
                    />
                  </div>
                  <span className="text-muted-foreground text-sm mr-1 pb-1.75 whitespace-nowrap">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-muted-foreground text-sm mr-1 pb-1.75 whitespace-nowrap">
                          {timeZoneAbbr}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="alignOffset={-40}">
                        We've detected this timezone.
                      </TooltipContent>
                    </Tooltip>
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
