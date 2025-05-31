import { useFormContext } from "react-hook-form";
import { ScheduleType, type ScheduleFormValues } from "./scheduleValidation";
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
import { ScheduleDatePickerField } from "./FormDatePicker";
import { CustomTimePicker } from "./FormTimePicker";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTimeZoneAbbreviation } from "./utils";

export function ScheduleForm({ now }: { now: Date }) {
  const form = useFormContext<ScheduleFormValues>();

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
                  <SelectItem value={ScheduleType.ONCE}>Run Once</SelectItem>
                  <SelectItem value={ScheduleType.DAILY}>Daily</SelectItem>
                  <SelectItem value={ScheduleType.WEEKLY}>Weekly</SelectItem>
                  <SelectItem value={ScheduleType.MONTHLY}>Monthly</SelectItem>
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
            <ScheduleDatePickerField field={field} now={now} />
          )}
        />
        <FormField
          control={form.control}
          name="scheduledTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">Time</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2 w-[200px] rounded-md">
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
                          {getTimeZoneAbbreviation(now)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="alignOffset={-40}">
                        Local timezone
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
