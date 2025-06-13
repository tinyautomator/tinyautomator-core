import { z } from "zod";

const baseTrigger = {
  calendarID: z.string().nullable().optional(),
  keywords: z.string(),
};

const cancelledTrigger = z.object({
  eventStatus: z.literal("cancelled"),
  ...baseTrigger,
});

const timeBasedTrigger = z.object({
  eventStatus: z.enum(["starting", "ending"]),
  ...baseTrigger,
  timeCondition: z
    .number({
      required_error: "Please select when the event should trigger",
    })
    .max(60 * 24 * 7 * 4, "Must be less than 4 weeks"),
});

const unselectedTrigger = z.object({
  eventStatus: z.null(),
  ...baseTrigger,
});

export const calendarTriggerFormSchema = z.discriminatedUnion("eventStatus", [
  cancelledTrigger,
  timeBasedTrigger,
  unselectedTrigger,
]);

export const calendarTriggerSchema = z.discriminatedUnion("eventStatus", [
  cancelledTrigger,
  timeBasedTrigger,
]);

export type CalendarTriggerSchema = z.infer<typeof calendarTriggerSchema>;
export type CalendarTriggerFormSchema = z.infer<
  typeof calendarTriggerFormSchema
>;

export const calendarTriggerDefaultValues: CalendarTriggerFormSchema = {
  eventStatus: null,
  calendarID: null,
  keywords: "",
};
