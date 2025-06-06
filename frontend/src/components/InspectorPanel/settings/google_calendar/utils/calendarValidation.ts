import { z } from "zod";

const MAX_SUMMARY_CHAR_COUNT = 100;
const MAX_DESCRIPTION_CHAR_COUNT = 1000;
const MAX_LOCATION_CHAR_COUNT = 200;

const eventScheduleSchema = z.object({
  start: z
    .object({
      type: z.enum(["immediate", "next-day", "custom"]),
      days: z.number().optional(),
      time: z.string().optional(),
    })
    .transform((data) => {
      if (data.type === "immediate") {
        return {
          type: data.type,
        };
      }
      if (data.type === "next-day") {
        return {
          type: data.type,
          time: data.time,
        };
      }
      return data;
    }),
  duration: z
    .object({
      isAllDay: z.boolean(),
      minutes: z.number().optional(),
    })
    .transform((data) => {
      if (data.isAllDay) {
        return {
          isAllDay: true,
        };
      }

      return {
        isAllDay: false,
        minutes: data.minutes,
      };
    }),
});

export const calendarFormSchema = z.object({
  calendarId: z.string().optional(),
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
  calendarId: undefined,
  summary: "",
  description: "",
  location: "",
  eventSchedule: {
    start: {
      type: "immediate",
    },
    duration: {
      isAllDay: false,
      minutes: 60,
    },
  },
  reminders: true,
};

export type CalendarFormValues = z.infer<typeof calendarFormSchema>;
export type EventSchedule = z.infer<typeof eventScheduleSchema>;
export type StartTiming = z.infer<typeof eventScheduleSchema>["start"];
export type Duration = z.infer<typeof eventScheduleSchema>["duration"];
