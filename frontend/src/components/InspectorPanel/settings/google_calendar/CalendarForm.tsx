import { useFormContext } from "react-hook-form";
import {
  CalendarFormValues,
  formDefaultValues,
} from "./utils/calendarValidation";
import { toast } from "sonner";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useFlowStore } from "@/components/Canvas/flowStore";
import { FormControls } from "@/components/shared/FormControls";
import { EventSchedule } from "./EventSchedule";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarSelector } from "./CalendarSelector";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { format } from "date-fns";

export function CalendarForm() {
  const { reset, handleSubmit, getValues, control } =
    useFormContext<CalendarFormValues>();
  const { getSelectedNode } = useFlowStore();
  const selectedNode = getSelectedNode();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const formattedTimeZone = format(new Date(), "zzzz");

  const onSubmit = handleSubmit(
    (data) => {
      if (!selectedNode) return;

      const configWithTimezone = {
        ...data,
        eventSchedule: {
          ...data.eventSchedule,
          timeZone,
        },
      };

      console.log(configWithTimezone);
      selectedNode.data.config = configWithTimezone;
      toast.success("Calendar event settings saved successfully");
    },
    (errors) => {
      const fieldOrder = Object.keys(getValues());
      fieldOrder.forEach((field) => {
        const message = errors[field as keyof CalendarFormValues]?.message;
        if (message) {
          toast.error(message);
        }
      });
    },
  );

  const handleReset = () => {
    reset(formDefaultValues as CalendarFormValues);
    if (selectedNode) {
      selectedNode.data.config = formDefaultValues;
    }
    toast.info("Calendar settings reset");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Card>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">Event Schedule</h3>
                <span className="text-xs font-medium text-destructive">
                  (Required)
                </span>
                <Tooltip>
                  <TooltipTrigger
                    className="text-muted-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <InfoIcon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    We use your local timezone ({formattedTimeZone}) for
                    scheduling
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-muted-foreground">
                Set when your event will take place
              </p>
            </div>

            <FormField
              control={control}
              name="eventSchedule"
              render={({ field }) => (
                <FormItem>
                  <EventSchedule
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">Additional Details</h3>
                <span className="text-xs font-medium text-muted-foreground">
                  (Optional)
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Add more information about your event
              </p>
            </div>

            <div className="space-y-4">
              <FormField
                control={control}
                name="calendarId"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel className="text-sm font-medium">
                        Calendar
                      </FormLabel>
                      <Tooltip>
                        <TooltipTrigger
                          className="text-muted-foreground"
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <InfoIcon className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          By default, we will use your primary calendar
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <CalendarSelector
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Title</FormLabel>
                    <Input {...field} placeholder="Event title" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Description
                    </FormLabel>
                    <Textarea {...field} placeholder="Event description" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Location
                    </FormLabel>
                    <Input {...field} placeholder="Event location" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="reminders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <FormLabel className="text-sm font-medium">
                        Reminders
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable default reminders for this event
                      </div>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <FormControls handleReset={handleReset} text="calendar event" />
    </form>
  );
}
