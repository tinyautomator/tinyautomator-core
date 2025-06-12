import { useFormContext } from "react-hook-form";
import {
  calendarTriggerDefaultValues,
  CalendarTriggerFormSchema,
} from "./utils/calendarTriggerSchema";
import {
  Form,
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarSelector } from "../google_calendar/CalendarSelector";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { FormControls } from "@/components/shared/FormControls";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { TimeUnit, convertToMinutes } from "./utils/timeHelpers";
import React from "react";
import { toast } from "sonner";
import { useFlowStore } from "@/components/Canvas/flowStore";

export function CalendarTriggerForm() {
  const form = useFormContext<CalendarTriggerFormSchema>();
  const { control, handleSubmit, reset, watch, setValue } = form;
  const { getSelectedNode } = useFlowStore();
  const selectedNode = getSelectedNode();

  const onSubmit = handleSubmit(
    (data) => {
      if (!selectedNode) return;
      if (!data.eventStatus) {
        toast.error("Please select an event action");
        return;
      }
      if (!data.calendarID) data.calendarID = "primary";
      // Convert form data to saved data format
      const keywords = data.keywords.split(",").map((k) => k.trim());
      const savedData =
        data.eventStatus === "cancelled"
          ? {
              eventStatus: "cancelled" as const,
              calendarID: data.calendarID,
              keywords: keywords,
            }
          : {
              eventStatus: data.eventStatus as "starting" | "ending",
              calendarID: data.calendarID,
              keywords: keywords,
              timeCondition: data.timeCondition,
            };

      selectedNode.data.config = savedData;
      console.log(savedData);
      toast.success("Calendar event settings saved successfully");
    },
    (errors) => {
      // Show all validation errors
      Object.entries(errors).forEach(([field, error]) => {
        console.log(field, error);
        if (error?.message) {
          toast.error(error.message);
        }
      });
    },
  );

  const eventStatus = watch("eventStatus");
  const timeCondition = watch("timeCondition");
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [customUnit, setCustomUnit] = useState<TimeUnit>("minute");
  const [isCustomizing, setIsCustomizing] = useState(false);

  const isTimeBasedTrigger = useMemo(
    () => eventStatus === "starting" || eventStatus === "ending",
    [eventStatus],
  );

  const isCustomTime =
    (typeof timeCondition === "string" && timeCondition === "custom") ||
    isCustomizing;

  // Update timeCondition when custom values change
  React.useEffect(() => {
    if (isCustomTime && customAmount > 0) {
      const minutes = convertToMinutes(customAmount, customUnit);
      setValue("timeCondition", minutes);
    }
  }, [isCustomTime, customAmount, customUnit, setValue]);

  // Reset custom values when switching away from custom time
  React.useEffect(() => {
    if (!isCustomTime) {
      setCustomAmount(0);
      setCustomUnit("minute");
      setIsCustomizing(false);
    }
  }, [isCustomTime]);

  const onReset = () => {
    reset(calendarTriggerDefaultValues);
    setCustomAmount(0);
    setCustomUnit("minute");
    setIsCustomizing(false);
    toast.info("Calendar trigger settings have been reset to default values.");
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormField
          control={control}
          name="eventStatus"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Event Action</FormLabel>
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
                    Select the action that will trigger the workflow
                  </TooltipContent>
                </Tooltip>
                <span className="text-xs font-medium text-destructive">
                  (Required)
                </span>
              </div>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <SelectTrigger className="min-w-[13em]">
                    <SelectValue placeholder="Select Event Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="starting">Starting</SelectItem>
                    <SelectItem value="ending">Ending</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        {isTimeBasedTrigger && (
          <>
            <FormField
              control={control}
              name="timeCondition"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>
                      {eventStatus === "starting" ? "Starts in" : "Ended after"}
                    </FormLabel>
                    <span className="text-xs font-medium text-destructive">
                      (Required)
                    </span>
                  </div>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        if (value === "custom") {
                          field.onChange(value);
                          setIsCustomizing(true);
                        } else {
                          field.onChange(Number(value));
                          setIsCustomizing(false);
                        }
                      }}
                      value={
                        isCustomizing
                          ? "custom"
                          : typeof field.value === "number"
                            ? field.value.toString()
                            : field.value || ""
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Time Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Immediately</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="720">12 hours</SelectItem>
                        <SelectItem value="1440">1 day</SelectItem>
                        <SelectItem value="2880">1 week</SelectItem>
                        {typeof field.value === "number" &&
                          field.value > 0 &&
                          ![
                            "0",
                            "15",
                            "30",
                            "60",
                            "720",
                            "1440",
                            "2880",
                          ].includes(field.value.toString()) && (
                            <SelectItem value={field.value.toString()}>
                              {field.value} minutes
                            </SelectItem>
                          )}
                        <SelectItem value="custom">Custom time</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            {isCustomTime && (
              <div className="flex gap-2">
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Amount"
                      value={customAmount || ""}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setCustomAmount(value);
                      }}
                    />
                  </FormControl>
                </FormItem>
                <FormItem className="flex-1">
                  <FormControl>
                    <Select
                      onValueChange={(value) =>
                        setCustomUnit(value as TimeUnit)
                      }
                      value={customUnit}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minute">Minutes</SelectItem>
                        <SelectItem value="hour">Hours</SelectItem>
                        <SelectItem value="day">Days</SelectItem>
                        <SelectItem value="week">Weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              </div>
            )}
          </>
        )}
        <FormField
          control={control}
          name="calendarID"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel className="text-sm font-medium">Calendar</FormLabel>
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
                value={field.value || undefined}
                onChange={field.onChange}
              />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Keywords</FormLabel>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    We will search the event for all the keywords you specify,
                    If the event contains all the keywords, the workflow will be
                    triggered
                  </TooltipContent>
                </Tooltip>
              </div>
              <FormControl>
                {/* TODO: use receipeint chips here */}
                <Input
                  placeholder="Enter keywords"
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormControls handleReset={onReset} text="calendar trigger" />
      </form>
    </Form>
  );
}
