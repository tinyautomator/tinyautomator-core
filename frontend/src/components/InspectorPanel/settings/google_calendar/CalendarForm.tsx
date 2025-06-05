import { useFormContext } from "react-hook-form";
import { CalendarFormValues } from "./utils/calendarValidation";
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
import { DateTimePicker } from "./DateTimePicker";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

export function CalendarForm() {
  const { reset, handleSubmit, getValues, control } =
    useFormContext<CalendarFormValues>();
  const { getSelectedNode } = useFlowStore();
  const selectedNode = getSelectedNode();

  const onSubmit = handleSubmit(
    (data) => {
      if (!selectedNode) return;
      selectedNode.data.config = data;
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
    reset({
      summary: "",
      description: "",
      location: "",
      startDate: { dateTime: "" },
      endDate: { dateTime: "" },
      reminders: true,
    });
    toast.info("Calendar event settings reset");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Event Schedule</h3>
            <span className="text-xs text-destructive">(Required)</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Set when your event will take place
          </p>
        </div>
        <Card>
          <CardContent>
            <div className="grid gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Start
                  </h4>
                </div>
                <FormField
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <DateTimePicker {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    End
                  </h4>
                </div>
                <FormField
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <DateTimePicker {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Additional Details</h3>
            <span className="text-xs text-muted-foreground">(Optional)</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Add more information about your event
          </p>
        </div>
        <FormField
          control={control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
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
              <FormLabel>Description</FormLabel>
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
              <FormLabel>Location</FormLabel>
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
              <div className="space-y-0.5">
                <FormLabel className="text-base">Reminders</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable default reminders for this event
                </div>
              </div>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormItem>
          )}
        />
      </div>

      <FormControls handleReset={handleReset} text="calendar event" />
    </form>
  );
}
