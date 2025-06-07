import { z } from "zod";

const MAX_SUMMARY_CHAR_COUNT = 100;
const MAX_DESCRIPTION_CHAR_COUNT = 1000;
const MAX_LOCATION_CHAR_COUNT = 200;

const eventScheduleSchema = z.object({
  start: z.object({
    type: z.enum(["immediate", "next-day", "custom"]),
    days: z.number().optional(),
    time: z.string().optional(),
  }),
  duration: z.discriminatedUnion("isAllDay", [
    z.object({
      isAllDay: z.literal(true),
    }),
    z.object({
      isAllDay: z.literal(false),
      minutes: z.number(),
    }),
  ]),
  timeZone: z.string().optional(),
});

export const calendarFormSchema = z.object({
  calendarID: z.string().optional(),
  summary: z
    .string()
    .max(MAX_SUMMARY_CHAR_COUNT, {
      message: `Summary must be under ${MAX_SUMMARY_CHAR_COUNT} characters`,
    })
    .optional(),
  description: z
    .string()
    .max(MAX_DESCRIPTION_CHAR_COUNT, {
      message: `Description must be under ${MAX_DESCRIPTION_CHAR_COUNT} characters`,
    })
    .optional(),
  attendees: z.array(z.string()).optional(),
  location: z
    .string()
    .max(MAX_LOCATION_CHAR_COUNT, {
      message: `Location must be under ${MAX_LOCATION_CHAR_COUNT} characters`,
    })
    .optional(),
  eventSchedule: eventScheduleSchema,
  reminders: z.boolean().optional(),
});

export const formDefaultValues = {
  calendarID: "",
  summary: "",
  description: "",
  attendees: [],
  location: "",
  eventSchedule: {
    start: {
      type: "immediate",
    },
    duration: {
      isAllDay: false,
      minutes: 60,
    },
    timeZone: "UTC",
  },
  reminders: true,
};

export type CalendarFormValues = z.infer<typeof calendarFormSchema>;
export type EventSchedule = z.infer<typeof eventScheduleSchema>;
export type StartTiming = z.infer<typeof eventScheduleSchema>["start"];
export type Duration = z.infer<typeof eventScheduleSchema>["duration"];
