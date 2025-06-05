import { z } from "zod";

const MAX_SUMMARY_CHAR_COUNT = 100;
const MAX_DESCRIPTION_CHAR_COUNT = 1000;
const MAX_LOCATION_CHAR_COUNT = 200;

export const eventDateTimeSchema = z
  .object({
    date: z.string().optional(),
    dateTime: z.string().optional(),
  })
  .refine((data) => data.date !== undefined || data.dateTime !== undefined, {
    message: "Either date or dateTime must be provided",
  });

export const calendarFormSchema = z.object({
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
  startDate: eventDateTimeSchema,
  endDate: eventDateTimeSchema,
  reminders: z.boolean().optional(),
});

export type CalendarFormValues = z.infer<typeof calendarFormSchema>;
